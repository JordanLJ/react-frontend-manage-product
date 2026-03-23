import axios from "axios";

function ProductList({ products, refreshProducts, setEditingProduct }) {

    const deleteProduct = async (id) => {
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
        refreshProducts();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Liste des Produits</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-gray-600">{product.description}</p>
                            <p className="text-gray-800 font-bold">{product.price} € | Qty: {product.quantity}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setEditingProduct(product)}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => deleteProduct(product.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;