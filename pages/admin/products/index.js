import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getData, deleData, getItem } from "@/feature/firebase/firebaseAuth";
import LayoutAdmin from "@/components/layout-body-admin";
import AuthContext from "@/feature/auth-context";

const Products = () => {
  const { userInfo } = useContext(AuthContext);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // State sắp xếp
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  // State tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const uid = localStorage.getItem("uid");
        console.log("uid",uid);
        const user = await getItem("users", uid);
        console.log("user", user);
        if (user && user.role === "admin") {
          setLoadingUserInfo(false);
        } else {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/admin");
      }
    };

    checkUserRole();
  }, [userInfo, router]);

  useEffect(() => {
    const fetchProducts = async () => { 

      setLoading(true);
      try {
        const productData = await getData("products");
        setProducts(productData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userInfo]);

  if (loadingUserInfo) {
    return (
      <LayoutAdmin>
        <h2 className="text-2xl md:text-4xl mt-5 font-bold text-center">
          Danh sách Sản phẩm
        </h2>

        <div className="mt-5 text-right">
          <button
            onClick={() => router.push("/admin/products/add")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            + Thêm sản phẩm
          </button>
        </div>
        <div className="text-center mt-10">Đang tải dữ liệu...</div>
      </LayoutAdmin>
    );
  }

  // Hàm sắp xếp
  const sortedProducts = () => {
    const sorted = [...products];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Tìm kiếm sản phẩm
  const filteredProducts = sortedProducts().filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán dữ liệu hiện tại cho trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Chuyển trang
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDelete = async (id) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
      if (confirm) {
        setLoadingId(id);

        await deleData("products", id);

        alert("Xóa sản phẩm thành công!");
        setProducts((prev) => prev.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.log("Lỗi khi xóa sản phẩm:", error);
      alert("Xóa sản phẩm thất bại!");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <LayoutAdmin>
      <h2 className="text-2xl md:text-4xl mt-5 font-bold text-center">
        Danh sách Sản phẩm
      </h2>

      <div className="mt-5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="text-right">
          <button
            onClick={() => router.push("/admin/products/add")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-10">Đang tải dữ liệu...</div>
      ) : (
        <div className="mt-10">
          {currentProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse bg-white shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm md:text-base">
                    <th className="px-2 py-2 border">STT</th>
                    <th
                      className="px-2 py-2 border cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Tên sản phẩm {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-2 py-2 border">Mô tả</th>
                    <th
                      className="px-2 py-2 border cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      Giá {sortConfig.key === "price" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-2 py-2 border">Hình ảnh</th>
                    <th className="px-2 py-2 border">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 text-sm md:text-base ${loadingId === product.id ? 'bg-gray-100 opacity-50' : ''}`}
                    >
                      <td className="px-2 py-2 border text-center">
                        {indexOfFirstProduct + index + 1}
                      </td>
                      <td className="px-2 py-2 border text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
                        {product.name}
                      </td>
                      <td className="px-2 py-2 border text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
                        {product.description}
                      </td>
                      <td className="px-2 py-2 border">{product.price}₫</td>
                      <td className="px-2 py-2 border text-center">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border text-center">
                        <button
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                          disabled={loadingId === product.id}
                        >
                          {loadingId === product.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm md:text-base">
              Không có sản phẩm nào.
            </p>
          )}

          {/* Điều khiển phân trang */}
          <div className="flex flex-wrap justify-between items-center mt-5 gap-4">
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm md:text-base"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-gray-700 text-sm md:text-base">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm md:text-base"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <br />
    </LayoutAdmin>
  );
};

export default Products;
