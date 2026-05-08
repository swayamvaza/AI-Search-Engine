#  LynxEngine: Neural Data Retrieval System

**LynxEngine** is a high-performance, AI-powered semantic search engine built on the MERN stack. Unlike traditional
keyword-based search, LynxEngine understands user **intent** using high-dimensional vector embeddings and features an
automated "Hunter" logic that scrapes and indexes Wikipedia in real-time when local data is insufficient.

---

##  Tech Stack

| Component     | Technology                                   |
|:--------------|:---------------------------------------------|
| **Frontend**  | React.js, React Router, Lucide-React         |
| **Backend**   | Node.js, Express.js, Axios, Cheerio          |
| **Database**  | MongoDB Atlas (Vector Search Index)          |
| **AI Models** | Ollama (mxbai-embed-large & Gemma 2:2b)      |
| **Styling**   | Custom CSS (Windows XP "Luna" Design System) |

---

##  System Architecture

LynxEngine operates through a **Three-Stage Retrieval Pipeline** designed for maximum precision:

### 1. Semantic Normalization

The user query is processed by **Gemma 2:2b** to resolve entities.

* *Example:* "lui hamilto" → `Lewis_Hamilton`.
* This ensures the "Hunter" lands on the correct Wikipedia URL immediately.

### 2. Vector Search (Semantic Mapping)

The normalized query is converted into a **1024-dimension vector** using `mxbai-embed-large`. The system performs a
`$vectorSearch` against MongoDB to find matches based on **Cosine Similarity**.

### 3. The Hunter Protocol (Auto-Ingestion)

If the highest similarity score falls below a dynamic threshold (e.g., **0.67**), the engine:

* Triggers a real-time crawl of Wikipedia.
* Parses and cleans the content using **Cheerio**.
* Generates new embeddings and indexes the data for future users.

---

##  Key Features

* **Vector Stability Check:** Uses a custom scoring algorithm to determine if search results are high-quality or if a
  fresh crawl is required.
* **Flag Prioritization:** Specialized scraper logic to detect and prioritize national flags and high-res SVG media for
  country-based queries.
* **Resilient Async Flow:** Implements `AbortController` watchdogs to prevent system hangs during local AI generation.
* **Nostalgic UX:** A complete, custom-built UI inspired by the **Windows XP (2005)** desktop environment, optimized for
  low-glare viewing.

---

##  Getting Started

### Prerequisites

* [Ollama](https://ollama.com/) installed and running.
* MongoDB Atlas account with a **Vector Search Index** named `vector_index`.
* Node.js & NPM.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/swayamvaza/AI-Search-Engine.git](https://github.com/swayamvaza/AI-Search-Engine.git)
   cd AI-Search-Engine

2. **Pull AI Models:**
   ```bash
      ollama pull mxbai-embed-large
      ollama pull gemma2:2b

3. **Launch Backend Engine:**

* Create a directory for backend
   ```bash
      cd backend
      npm install
      node server.js

4. **Launch Frontend Engine:**

* Create a directory for frontend
   ```bash
      cd frontend
      npm install
      npm start

├── client/ # React Frontend (XP Design System)
├── server.js # Node.js Server & Scraper Logic
├── Item.js # Mongoose Schema for Vector Documents
├── .env # System Environment Variables
└── README.md # System Documentation

---

##  Author

| **Swayam Kumar** | [![](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/swayamvaza) |
| :--- | :--- |
| **Project Repository** | [**AI-Search-Engine**](https://github.com/swayamvaza/AI-Search-Engine) |
| **Tech Stack** | MERN + AI (Ollama) |

---

<p align="center">
  <i>Developed by Swayam Kumar</i><br>
  <strong>LynxEngine v1.02</strong>
</p>

