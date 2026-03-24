import { useEffect, useState } from "react";
import axios from "axios";
import { AUTH_CONFIG } from "./config/auth";

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("identity_access_token"));
  const [authError, setAuthError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // États du formulaire
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [marketingName, setMarketingName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantStock, setVariantStock] = useState("");

  const API_BASE_URL = AUTH_CONFIG.API_URL;
  const CATEGORY_API = `${API_BASE_URL}/categories`;
  const OAUTH_BASE_URL = `${AUTH_CONFIG.ISSUER}/v1/${AUTH_CONFIG.TENANT}/oauth`;

  const getAuthHeaders = () => {
    const storedToken = localStorage.getItem("identity_access_token");
    return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
  };

  const toBase64Url = (bytes) => {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const generateRandomString = (length = 64) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (byte) => charset[byte % charset.length]).join("");
  };

  const createCodeChallenge = async (verifier) => {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return toBase64Url(new Uint8Array(digest));
  };

  const startLogin = async () => {
    try {
      setAuthError("");
      const state = generateRandomString(48);
      const codeVerifier = generateRandomString(96);
      const codeChallenge = await createCodeChallenge(codeVerifier);

      sessionStorage.setItem("oauth_state", state);
      sessionStorage.setItem("oauth_code_verifier", codeVerifier);

      const params = new URLSearchParams({
        provider: "entra_id",
        response_type: "code",
        client_id: AUTH_CONFIG.CLIENT_ID,
        redirect_uri: AUTH_CONFIG.REDIRECT_URI,
        scope: AUTH_CONFIG.SCOPES,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      window.location.href = `${OAUTH_BASE_URL}/authorize?${params.toString()}`;
    } catch (error) {
      console.error("Erreur démarrage OAuth:", error);
      setAuthError("Impossible de démarrer l'authentification OAuth.");
    }
  };

  const logout = () => {
    localStorage.removeItem("identity_access_token");
    localStorage.removeItem("identity_refresh_token");
    setProducts([]);
    setAuthError("");
    setIsAuthenticated(false);
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_code_verifier");
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pm/dashboard`, {
        headers: getAuthHeaders(),
      });
      setDashboard(res.data);
    } catch (error) {
      console.error("Erreur dashboard:", error);
    }
  };

  // Récupérer les produits
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pm/products`, {
        headers: getAuthHeaders(),
        params: statusFilter ? { status: statusFilter } : {},
      });
      const backendProducts = res.data?.data || [];
      setProducts(Array.isArray(backendProducts) ? backendProducts : []);
      setAuthError("");
      fetchDashboard();
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Impossible de récupérer les produits. Vérifie ton token Bearer.";
      setAuthError(message);
      if (error?.response?.status === 401) {
        setIsAuthenticated(false);
      }
      console.error("Erreur fetch produits:", error);
    }
  };

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data); // backend retourne tableau {id, name}
      if (res.data.length > 0 && !categoryId) setCategoryId(res.data[0].id);
    } catch (error) {
      console.error("Erreur fetch catégories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (localStorage.getItem("identity_access_token")) {
      fetchProducts();
    }
  }, [statusFilter]);

  useEffect(() => {
    const completeOAuthCallback = async () => {
      if (!window.location.pathname.includes("/auth/callback")) {
        return;
      }

      setIsAuthenticating(true);
      setAuthError("");

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const receivedState = searchParams.get("state");
      const savedState = sessionStorage.getItem("oauth_state");
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

      if (!code) {
        setAuthError("Code d'autorisation manquant dans le callback.");
        setIsAuthenticating(false);
        return;
      }

      if (!receivedState || !savedState || receivedState !== savedState) {
        setAuthError("State OAuth invalide. Relance la connexion.");
        setIsAuthenticating(false);
        return;
      }

      if (!codeVerifier) {
        setAuthError("Code verifier PKCE introuvable. Relance la connexion.");
        setIsAuthenticating(false);
        return;
      }

      try {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: AUTH_CONFIG.REDIRECT_URI,
          client_id: AUTH_CONFIG.CLIENT_ID,
          code_verifier: codeVerifier,
        });

        const tokenResponse = await axios.post(`${OAUTH_BASE_URL}/token`, body.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const accessToken = tokenResponse.data?.access_token;
        const refreshToken = tokenResponse.data?.refresh_token;

        if (!accessToken) {
          throw new Error("No access_token returned");
        }

        localStorage.setItem("identity_access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("identity_refresh_token", refreshToken);
        }

        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_code_verifier");
        setIsAuthenticated(true);

        window.history.replaceState({}, "", "/");
        fetchProducts();
      } catch (error) {
        console.error("Erreur échange code/token:", error);
        setAuthError(
          error?.response?.data?.error_description ||
            error?.response?.data?.error ||
            "Échec de l'échange code/token."
        );
      } finally {
        setIsAuthenticating(false);
      }
    };

    completeOAuthCallback();
  }, []);

  // Ajouter ou mettre à jour un produit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        marketing_name: marketingName,
        price,
        description,
        quantity,
        sku,
        category_id: categoryId,
        primary_category_id: categoryId,
      };

      if (id) {
        await axios.put(`${API_BASE_URL}/pm/products/${id}`, payload, {
          headers: getAuthHeaders(),
        });
      } else {
        const create = await axios.post(`${API_BASE_URL}/pm/products`, payload, {
          headers: getAuthHeaders(),
        });

        const productId = create.data?.id;

        if (productId && variantSku) {
          await axios.post(`${API_BASE_URL}/pm/products/${productId}/variants`, {
            sku: variantSku,
            price: variantPrice ? Number(variantPrice) : Number(price),
            stock: variantStock ? Number(variantStock) : Number(quantity),
            currency: "EUR",
          }, {
            headers: getAuthHeaders(),
          });
        }

        if (productId && mediaPath) {
          await axios.post(`${API_BASE_URL}/pm/products/${productId}/media`, {
            type: "image",
            path: mediaPath,
            sort_order: 1,
          }, {
            headers: getAuthHeaders(),
          });
        }
      }

      // Réinitialiser le formulaire
      setId(null);
      setName("");
      setMarketingName("");
      setPrice("");
      setDescription("");
      setQuantity("");
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setSku("");
      setMediaPath("");
      setVariantSku("");
      setVariantPrice("");
      setVariantStock("");

      fetchProducts();
    } catch (error) {
      console.error("Erreur ajout/modification produit:", error);
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/pm/products/${id}/archive`, {}, {
        headers: getAuthHeaders(),
      });
      fetchProducts();
    } catch (error) {
      console.error("Erreur suppression produit:", error);
    }
  };

  // Préparer le formulaire pour modification
  const editProduct = (product) => {
    setId(product.id);
    setName(product.name);
    setMarketingName(product.marketing_name || "");
    setPrice(product.price);
    setDescription(product.description);
    setQuantity(product.quantity);
    setCategoryId(product.primary_category_id || product.category_id || "");
    setSku(product.sku);
  };

  const submitProduct = async (productId) => {
    await axios.post(`${API_BASE_URL}/pm/products/${productId}/submit`, {}, { headers: getAuthHeaders() });
    fetchProducts();
  };

  const publishProduct = async (productId) => {
    await axios.post(`${API_BASE_URL}/pm/products/${productId}/publish`, {}, { headers: getAuthHeaders() });
    fetchProducts();
  };

  return (
    <div className="app-shell">
      <div className="intro-container">
        <header className="intro-header">
          <div>
            <h1>Gestion des Produits</h1>
            <p>Frontend React connecte au backend Laravel + OAuth2.</p>
          </div>
          <span className={`auth-chip ${isAuthenticated ? "ok" : "ko"}`}>
            {isAuthenticated ? "Connecte" : "Non connecte"}
          </span>
        </header>

        <section className="intro-card">
          {dashboard ? (
            <div className="stats-grid">
              <span>Total: {dashboard.stats?.total ?? 0}</span>
              <span>Brouillon: {dashboard.stats?.draft ?? 0}</span>
              <span>En validation: {dashboard.stats?.pending_validation ?? 0}</span>
              <span>Publies: {dashboard.stats?.published ?? 0}</span>
              <span>Archives: {dashboard.stats?.archived ?? 0}</span>
            </div>
          ) : null}
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={startLogin} disabled={isAuthenticating}>
              {isAuthenticating ? "Connexion en cours..." : "Se connecter (OAuth)"}
            </button>
            <button type="button" className="btn" onClick={logout}>
              Se deconnecter
            </button>
            <button type="button" className="btn" onClick={fetchProducts} disabled={!isAuthenticated}>
              Recharger les produits
            </button>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending_validation">En validation</option>
              <option value="published">Publie</option>
              <option value="archived">Archive</option>
            </select>
          </div>
          {authError ? <p className="intro-alert">{authError}</p> : null}
        </section>

        <section className="intro-card">
          <h2>{id ? "Modifier un produit" : "Ajouter un produit"}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="Nom marketing" value={marketingName} onChange={(e) => setMarketingName(e.target.value)} />
            <input placeholder="Prix" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input placeholder="Quantite" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
            {!id ? (
              <>
                <input placeholder="SKU variante (optionnel)" value={variantSku} onChange={(e) => setVariantSku(e.target.value)} />
                <input placeholder="Prix variante (optionnel)" type="number" value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} />
                <input placeholder="Stock variante (optionnel)" type="number" value={variantStock} onChange={(e) => setVariantStock(e.target.value)} />
                <input placeholder="URL media image (optionnel)" value={mediaPath} onChange={(e) => setMediaPath(e.target.value)} />
              </>
            ) : null}
            <button type="submit" className="btn btn-primary btn-full">
              {id ? "Mettre a jour" : "Ajouter"}
            </button>
          </form>
        </section>

        <section className="intro-card">
          <h2>Liste des produits</h2>
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prix</th>
                  <th>Description</th>
                  <th>Quantite</th>
                  <th>Categorie</th>
                  <th>SKU</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.description}</td>
                      <td>{product.quantity}</td>
                      <td>{product.category?.name || "-"}</td>
                      <td>{product.sku}</td>
                      <td>{product.status}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-small" onClick={() => editProduct(product)}>
                            Modifier
                          </button>
                          <button className="btn btn-small" onClick={() => submitProduct(product.id)}>
                            Soumettre
                          </button>
                          <button className="btn btn-small btn-primary" onClick={() => publishProduct(product.id)}>
                            Publier
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => deleteProduct(product.id)}>
                            Archiver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-row">
                      Aucun produit trouve
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;