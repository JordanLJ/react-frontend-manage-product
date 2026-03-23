import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // États du formulaire
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState(""); // <-- category_id
  const [sku, setSku] = useState("");

  const API_URL = "http://127.0.0.1:8000/api/products";
  const CATEGORY_API = "http://127.0.0.1:8000/api/categories";

  // Récupérer les produits
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data.data);
    } catch (error) {
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
    fetchProducts();
    fetchCategories();
  }, []);

  // Ajouter ou mettre à jour un produit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        price,
        description,
        quantity,
        sku,
        category_id: categoryId, // <-- correspond au backend
      };

      if (id) {
        await axios.put(`${API_URL}/${id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      // Réinitialiser le formulaire
      setId(null);
      setName("");
      setPrice("");
      setDescription("");
      setQuantity("");
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setSku("");

      fetchProducts();
    } catch (error) {
      console.error("Erreur ajout/modification produit:", error);
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Erreur suppression produit:", error);
    }
  };

  // Préparer le formulaire pour modification
  const editProduct = (product) => {
    setId(product.id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setQuantity(product.quantity);
    setCategoryId(product.category?.id || ""); // relation category
    setSku(product.sku);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Gestion des Produits</h1>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Prix"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          placeholder="Quantité"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        {/* SELECT CATÉGORIE */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />

        <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
      </form>

      {/* TABLEAU PRODUITS */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Description</th>
            <th>Quantité</th>
            <th>Catégorie</th>
            <th>SKU</th>
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
                <td>{product.category?.name || ""}</td>
                <td>{product.sku}</td>
                <td>
                  <button onClick={() => editProduct(product)}>Modifier</button>
                  <button onClick={() => deleteProduct(product.id)}>Supprimer</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Aucun produit trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;