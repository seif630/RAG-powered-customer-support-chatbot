import json
import os
import random
import re
from threading import Lock

import faiss
import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request
from sklearn.feature_extraction.text import TfidfVectorizer


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECORDS_PATH = os.path.join(BASE_DIR, "records.csv")
INDEX_PATH = os.path.join(BASE_DIR, "vector_index.faiss")
ID_MAP_PATH = os.path.join(BASE_DIR, "id_map.json")
TOP_K = 1
DEFAULT_THRESHOLD = 0.45


app = Flask(__name__)
startup_lock = Lock()
embed_model = None
records = None
index = None
id_map = None
retrieval_backend = None
tfidf_vectorizer = None
tfidf_matrix = None


def normalize(text: str) -> str:
    text = re.sub(r"\{\{[^}]+\}\}", "[ENTITY]", str(text))
    text = re.sub(r"(\[ENTITY\]\s*)+", "[ENTITY] ", text)
    return text.strip()


COMPANY_INFO = {
    "Customer Support Hours": "9 AM to 5 PM EST, Monday through Friday",
    "Customer Support Phone Number": "1-800-123-4567",
    "Website URL": "www.example.com",
    "Online Company Portal Info": "Company Portal",
    "Online Order Interaction": "My Orders section",
    "Order Tracking": "<a href='/track' style='color: var(--primary-2); font-weight: 500;' target='_blank'>Track Order</a>",
}

def clean_response(text: str, question: str = "") -> str:
    def get_order_number():
        match = re.search(r'\b(?:#|[A-Za-z]{2,}-)?\d{4,}\b', question)
        if match:
            return match.group(0)
        return f"ORD-{random.randint(10000, 99999)}"

    dynamic_info = {
        "Order Number": get_order_number()
    }

    def replace_placeholder(match):
        key = match.group(1).strip()
        if key in dynamic_info:
            return dynamic_info[key]
        if key in COMPANY_INFO:
            return COMPANY_INFO[key]
            
        k = key.lower()
        if 'email' in k:
            return "support@example.com"
        if 'url' in k or 'link' in k or 'website' in k or 'page' in k:
            return "our website"
        if 'phone' in k or 'number' in k or 'hotline' in k:
            return "1-800-555-0199"
        if 'time' in k or 'days' in k or 'hours' in k or 'period' in k or 'timeframe' in k:
            return "2 to 3 business days"
        if 'date' in k:
            return "the scheduled date"
        if 'name' in k:
            return "John Doe"
        if 'city' in k or 'country' in k or 'destination' in k or 'address' in k or 'location' in k:
            return "your registered address"
        if 'password' in k or 'pin' in k or 'key' in k:
            return "your secure credentials"
        if 'amount' in k:
            return "$0.00"
        if 'step' in k:
            return "the next step"
        if 'account' in k or 'profile' in k:
            return "your account"
        return f"the {k}"

    text = re.sub(r"\$??\{\{([^}]+)\}\}", replace_placeholder, str(text))
    text = re.sub(r"\[ENTITY\]", "the item", text)
    return text


def build_faiss_artifacts() -> None:
    global index, id_map, records

    raw_df = pd.read_csv(RECORDS_PATH)

    if "id" not in raw_df.columns:
        raw_df["id"] = [f"rec_{i:05d}" for i in range(len(raw_df))]

    if "composite_text" not in raw_df.columns:
        raw_df["composite_text"] = raw_df.apply(
            lambda row: f"{row.get('intent', '')} {row.get('category', '')} {normalize(row.get('instruction', ''))}",
            axis=1,
        )

    records = raw_df.set_index("id")
    vectors = embed_model.encode(
        records["composite_text"].tolist(),
        batch_size=64,
        show_progress_bar=True,
        normalize_embeddings=True,
    ).astype("float32")

    dim = vectors.shape[1]
    new_index = faiss.IndexFlatIP(dim)
    new_index.add(vectors)

    new_id_map = {str(i): rec_id for i, rec_id in enumerate(records.index.tolist())}
    faiss.write_index(new_index, INDEX_PATH)
    with open(ID_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(new_id_map, f)

    index = new_index
    id_map = new_id_map


def build_tfidf_artifacts() -> None:
    global tfidf_vectorizer, tfidf_matrix, records

    raw_df = pd.read_csv(RECORDS_PATH)
    if "id" not in raw_df.columns:
        raw_df["id"] = [f"rec_{i:05d}" for i in range(len(raw_df))]

    if "composite_text" not in raw_df.columns:
        raw_df["composite_text"] = raw_df.apply(
            lambda row: f"{row.get('intent', '')} {row.get('category', '')} {normalize(row.get('instruction', ''))}",
            axis=1,
        )

    records = raw_df.set_index("id")
    tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
    tfidf_matrix = tfidf_vectorizer.fit_transform(records["composite_text"].tolist())


def load_or_build() -> None:
    global embed_model, records, index, id_map, retrieval_backend
    with startup_lock:
        if retrieval_backend == "sentence-transformers" and embed_model is not None and records is not None and index is not None and id_map is not None:
            return
        if retrieval_backend == "tfidf" and records is not None and tfidf_vectorizer is not None and tfidf_matrix is not None:
            return

        try:
            from sentence_transformers import SentenceTransformer  # Lazy import to avoid hard failure on Windows DLL issues.
            embed_model = SentenceTransformer("BAAI/bge-m3")
            records = pd.read_csv(RECORDS_PATH).set_index("id")

            if os.path.exists(INDEX_PATH) and os.path.exists(ID_MAP_PATH):
                index = faiss.read_index(INDEX_PATH)
                with open(ID_MAP_PATH, "r", encoding="utf-8") as f:
                    id_map = json.load(f)
            else:
                build_faiss_artifacts()
            retrieval_backend = "sentence-transformers"
        except Exception:
            build_tfidf_artifacts()
            retrieval_backend = "tfidf"


def ask_rag(question: str, score_threshold: float = DEFAULT_THRESHOLD, last_intent: str = None) -> dict:
    search_query = f"{last_intent} {question}" if last_intent else question
    normalized_question = normalize(search_query)
    if retrieval_backend == "sentence-transformers":
        q_vector = embed_model.encode([normalized_question], normalize_embeddings=True).astype("float32").reshape(1, -1)
        distances, indices = index.search(q_vector, TOP_K)
        top_score = float(distances[0][0])
        top_idx = int(indices[0][0])
        rec_id = id_map[str(top_idx)]
    else:
        query_vec = tfidf_vectorizer.transform([normalized_question])
        scores = (tfidf_matrix @ query_vec.T).toarray().ravel()
        top_idx = int(np.argmax(scores))
        top_score = float(scores[top_idx])
        rec_id = records.index[top_idx]

        # Tfidf scores are usually lower than embedding cosine scores.
        score_threshold = min(score_threshold, 0.12)

    if top_score < score_threshold:
        return {
            "answer": "I don't have enough information to answer that.",
            "score": round(top_score, 4),
            "matched_intent": None,
            "backend": retrieval_backend,
        }

    record = records.loc[rec_id]

    return {
        "answer": clean_response(record["response"], question),
        "score": round(top_score, 4),
        "matched_intent": record.get("intent", "unknown"),
        "backend": retrieval_backend,
    }


@app.get("/")
def home():
    return render_template("index.html")

@app.get("/track")
def track():
    return render_template("track.html")

@app.get("/infograph")
def infograph():
    return render_template("infograph.html")


@app.post("/api/chat")
def chat():
    load_or_build()
    payload = request.get_json(silent=True) or {}
    question = str(payload.get("message", "")).strip()
    last_intent = payload.get("last_intent")

    if not question:
        return jsonify({"error": "message is required"}), 400

    threshold = payload.get("threshold", DEFAULT_THRESHOLD)
    try:
        threshold = float(threshold)
    except (TypeError, ValueError):
        threshold = DEFAULT_THRESHOLD

    result = ask_rag(question, score_threshold=threshold, last_intent=last_intent)
    return jsonify(result)


if __name__ == "__main__":
    load_or_build()
    app.run(host="0.0.0.0", port=5000, debug=True)
