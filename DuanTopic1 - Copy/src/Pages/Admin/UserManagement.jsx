import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus, FaKey } from "react-icons/fa";
import { useEffect, useState } from "react";
import { userAPI, dealerAPI } from "../../services/API.js";
import { getRoleDisplayName } from "../../config/roleMenus.js";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState({ username: "", password: "", role: "" });
  
  // Cache role để giữ lại role ngay cả khi API không trả về
  const [roleCache, setRoleCache] = useState(() => {
    try {
      const cached = localStorage.getItem('userRoleCache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    role: "", // Không có giá trị mặc định, bắt buộc chọn
    dealerId: "",
    password: "", // Thêm field password để admin có thể set
    isActive: true,
  });

  // ✅ Lấy danh sách users
  const fetchUsers = async () => {
    try {
      // Đảm bảo dealers đã được fetch trước khi xử lý users (để có thể map dealer từ danh sách)
      let dealersData = dealers;
      if (dealers.length === 0) {
        try {
          const dealersRes = await dealerAPI.getAll();
          dealersData = dealersRes.data || [];
          setDealers(dealersData);
        } catch (dealersErr) {
          console.warn("⚠️ Không thể fetch dealers, tiếp tục với users:", dealersErr);
        }
      }
      
      const res = await userAPI.getUsers();
      const usersData = res.data || [];
      console.log("📥 Danh sách users từ API:", usersData);
      console.log("📥 Trạng thái isActive của từng user:", usersData.map(u => ({ 
        username: u.username, 
        isActive: u.isActive,
        userId: u.userId 
      })));
      console.log("📥 Role của từng user:", usersData.map(u => ({ 
        username: u.username, 
        role: u.role,
        userType: u.userType,
        userRole: u.userRole,
        roles: u.roles,
        userId: u.userId 
      })));
      console.log("📥 Dealer của từng user:", usersData.map(u => ({ 
        username: u.username, 
        dealerId: u.dealerId,
        dealer: u.dealer,
        dealerName: u.dealer?.dealerName,
        userId: u.userId 
      })));
      
      // Đảm bảo xử lý isActive, role và dealer đúng cách - GIỮ NGUYÊN giá trị từ API
      // Lưu state cũ để merge role nếu API không trả về
      const oldUsersMap = new Map(users.map(u => [u.userId, u]));
      
      const processedUsers = usersData.map(u => {
        // Log để debug
        const originalIsActive = u.isActive;
        const originalRole = u.role;
        
        // Nếu API không trả về role, thử lấy từ state cũ
        const oldUser = oldUsersMap.get(u.userId);
        if (!originalRole && oldUser && oldUser.role) {
          console.log(`⚠️ User ${u.username}: API không trả về role, dùng từ state cũ:`, oldUser.role);
        }
        
        // Xử lý role: thử lấy từ nhiều field khác nhau
        // Backend có thể dùng userType thay vì role
        let processedRole = u.role || u.userType;
        if ((!processedRole || processedRole === "" || processedRole === null || processedRole === undefined) && u.userRole) {
          processedRole = u.userRole;
          console.log(`⚠️ User ${u.username}: role không có, dùng userRole: ${u.userRole}`);
        } else if ((!processedRole || processedRole === "" || processedRole === null || processedRole === undefined) && u.roles && Array.isArray(u.roles) && u.roles.length > 0) {
          processedRole = u.roles[0];
          console.log(`⚠️ User ${u.username}: role không có, dùng roles[0]: ${u.roles[0]}`);
        } else if (!processedRole || processedRole === "" || processedRole === null || processedRole === undefined) {
          console.warn(`⚠️ User ${u.username}: role là ${originalRole} (${typeof originalRole}), userType là ${u.userType}, userRole là ${u.userRole}, roles là ${u.roles}`);
        }
        
        // Đảm bảo processedRole không phải empty string
        if (processedRole === "") {
          processedRole = originalRole; // Giữ nguyên originalRole nếu processedRole là empty string
        }
        
        // QUAN TRỌNG: Giữ nguyên giá trị từ API, KHÔNG thay đổi
        // Nếu API trả về false, giữ nguyên false
        // Nếu API trả về true, giữ nguyên true
        // Chỉ mặc định true nếu thực sự undefined hoặc null
        let processedIsActive;
        if (originalIsActive === false) {
          processedIsActive = false; // Giữ nguyên false
        } else if (originalIsActive === true) {
          processedIsActive = true; // Giữ nguyên true
        } else {
          processedIsActive = true; // Mặc định true nếu undefined/null
          console.log(`⚠️ User ${u.username}: isActive là ${originalIsActive}, mặc định thành true`);
        }
        
        if (originalIsActive !== processedIsActive && originalIsActive !== undefined && originalIsActive !== null) {
          console.log(`❌ User ${u.username}: isActive bị thay đổi từ ${originalIsActive} → ${processedIsActive}`);
        }
        
        // Xử lý dealer: nếu API không trả về dealer object nhưng có dealerId, tìm từ danh sách dealers
        let processedDealer = u.dealer;
        if (!processedDealer && u.dealerId) {
          // Tìm dealer từ danh sách dealers đã có (nếu đã fetch)
          const dealerFromList = dealersData.find(d => d.dealerId === u.dealerId);
          if (dealerFromList) {
            processedDealer = {
              dealerId: dealerFromList.dealerId,
              dealerName: dealerFromList.dealerName
            };
            console.log(`⚠️ User ${u.username}: dealer không có trong API, dùng từ danh sách: ${dealerFromList.dealerName}`);
          } else {
            console.warn(`⚠️ User ${u.username}: có dealerId (${u.dealerId}) nhưng không tìm thấy dealer trong danh sách`);
          }
        }
        
        // Đảm bảo role không bị mất - ưu tiên processedRole, sau đó originalRole, cuối cùng là u.role hoặc u.userType
        // Thử lấy từ nhiều nguồn
        let finalRole = processedRole || originalRole || u.role || u.userType;
        if (!finalRole || finalRole === "" || finalRole === null || finalRole === undefined) {
          finalRole = u.userRole || (u.roles && Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null);
          if (finalRole) {
            console.log(`⚠️ User ${u.username}: dùng role từ userRole/roles trong fetchUsers:`, finalRole);
          }
        }
        
        // Nếu vẫn không có role, thử lấy từ state cũ
        if ((!finalRole || finalRole === "" || finalRole === null || finalRole === undefined) && oldUser && oldUser.role) {
          finalRole = oldUser.role;
          console.log(`⚠️ User ${u.username}: dùng role từ state cũ:`, finalRole);
        }
        
        // Nếu vẫn không có role, thử lấy từ cache
        if ((!finalRole || finalRole === "" || finalRole === null || finalRole === undefined) && roleCache[u.userId]) {
          finalRole = roleCache[u.userId];
          console.log(`⚠️ User ${u.username}: dùng role từ cache:`, finalRole);
        }
        
        // Nếu có role, lưu vào cache
        if (finalRole && finalRole !== "" && finalRole !== null && finalRole !== undefined) {
          if (!roleCache[u.userId] || roleCache[u.userId] !== finalRole) {
            setRoleCache(prev => {
              const newCache = { ...prev, [u.userId]: finalRole };
              try {
                localStorage.setItem('userRoleCache', JSON.stringify(newCache));
              } catch (e) {
                console.warn("Không thể lưu role vào localStorage:", e);
              }
              return newCache;
            });
          }
        }
        
        // Debug: log nếu vẫn không có role
        if (!finalRole || finalRole === "" || finalRole === null || finalRole === undefined) {
          console.error(`❌ User ${u.username} KHÔNG CÓ ROLE sau khi xử lý!`, {
            originalRole: originalRole,
            processedRole: processedRole,
            userRole: u.userRole,
            roles: u.roles,
            oldUserRole: oldUser?.role,
            cachedRole: roleCache[u.userId],
            finalRole: finalRole
          });
        }
        
        return {
          ...u,
          // GIỮ NGUYÊN giá trị isActive từ API
          isActive: processedIsActive,
          // GIỮ NGUYÊN giá trị role từ API (hoặc từ fallback) - đảm bảo không bị empty string
          // Backend có thể dùng userType thay vì role
          role: finalRole && finalRole !== "" ? finalRole : (roleCache[u.userId] || oldUser?.role || u.role || u.userType || u.userRole || (u.roles && Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null)),
          // GIỮ NGUYÊN dealer object từ API (hoặc từ danh sách dealers)
          dealer: processedDealer || u.dealer
        };
      });
      
      setUsers(processedUsers);
      console.log("✅ Đã cập nhật danh sách users vào state");
      console.log("✅ Trạng thái sau xử lý:", processedUsers.map(u => ({ 
        username: u.username, 
        isActive: u.isActive,
        role: u.role,
        roleType: typeof u.role,
        hasRole: !!u.role
      })));
      
      // Debug: kiểm tra users không có role
      const usersWithoutRole = processedUsers.filter(u => !u.role || u.role === "" || u.role === null || u.role === undefined);
      if (usersWithoutRole.length > 0) {
        console.warn(`⚠️ Có ${usersWithoutRole.length} user không có role:`, usersWithoutRole.map(u => ({
          username: u.username,
          role: u.role,
          roleType: typeof u.role
        })));
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách users:", err);
      console.error("Error details:", err.response?.data);
    }
  };

  // ✅ Lấy danh sách dealers
  const fetchDealers = async () => {
    try {
      const res = await dealerAPI.getAll();
      setDealers(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dealers:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDealers();
  }, []);

  // ✅ Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchUsers();
        return;
      }
      try {
        const res = await userAPI.getUsers();
        const usersData = res.data || [];
        // Xử lý role tương tự như trong fetchUsers
        const processedUsers = usersData.map(u => {
          let processedRole = u.role;
          if (!processedRole && u.userRole) {
            processedRole = u.userRole;
          } else if (!processedRole && u.roles && Array.isArray(u.roles) && u.roles.length > 0) {
            processedRole = u.roles[0];
          }
          return {
            ...u,
            role: processedRole || u.role
          };
        });
        const filtered = processedUsers.filter(u => {
          const keyword = trimmed.toLowerCase();
          return (
            u.username?.toLowerCase().includes(keyword) ||
            u.email?.toLowerCase().includes(keyword) ||
            u.fullName?.toLowerCase().includes(keyword) ||
            getRoleName(u.role)?.toLowerCase().includes(keyword)
          );
        });
        setUsers(filtered);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = async (user) => {
    try {
      const res = await userAPI.getUser(user.userId);
      setSelectedUser(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết user:", err);
      setSelectedUser(user);
      setShowDetail(true);
    }
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedUser(null);
    // Tạo password mặc định ngẫu nhiên
    const defaultPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      role: "", // Không có giá trị mặc định
      dealerId: "",
      password: defaultPassword, // Password mặc định
      isActive: true,
    });
    setError("");
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (user) => {
    setIsEdit(true);
    setSelectedUser(user);
    
    // Xử lý isActive: nếu undefined/null thì mặc định true, nếu false thì false
    const isActiveValue = user.isActive === false ? false : true;
    
    console.log("📝 Mở form sửa user:", user.username);
    console.log("📝 isActive từ API:", user.isActive, "type:", typeof user.isActive);
    console.log("📝 isActive sau xử lý:", isActiveValue);
    console.log("📝 Role từ API:", user.role, "type:", typeof user.role);
    
    setFormData({
      username: user.username || "",
      email: user.email || "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role || "", // Giữ nguyên role từ user, không có fallback
      dealerId: user.dealer?.dealerId || "",
      password: "", // Không hiển thị password khi sửa
      isActive: isActiveValue,
    });
    setError("");
    setShowPopup(true);
  };

  // ✅ Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;
    try {
      await userAPI.deleteUser(id);
      alert("Xóa tài khoản thành công!");
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa tài khoản!");
    }
  };

  // ✅ Reset password
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn reset mật khẩu cho ${user.username}?`)) return;
    try {
      console.log("🔄 Đang reset password cho user:", user.username);
      
      // Thử reset bằng userId trước
      let res;
      try {
        res = await userAPI.resetPassword(user.userId);
        console.log("✅ Reset password response (by ID):", res);
      } catch (idErr) {
        console.log("⚠️ Reset by ID failed, thử bằng username...");
        // Nếu không được, thử bằng username
        res = await userAPI.resetPasswordByUsername(user.username);
        console.log("✅ Reset password response (by username):", res);
      }
      
      let newPassword = "";
      
      // Kiểm tra nhiều vị trí trong response
      if (res.data?.password) {
        newPassword = res.data.password;
      } else if (res.data?.newPassword) {
        newPassword = res.data.newPassword;
      } else if (res.data?.data?.password) {
        newPassword = res.data.data.password;
      } else if (res.data?.data?.newPassword) {
        newPassword = res.data.data.newPassword;
      } else {
        // Nếu không có password, tạo password mặc định
        newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        console.log("⚠️ API không trả về password, tạo password mặc định:", newPassword);
      }
      
      console.log("✅ Final password:", newPassword);
      
      setPasswordInfo({
        username: user.username,
        password: newPassword,
        role: user.role || ""
      });
      setShowPasswordModal(true);
      alert("Reset mật khẩu thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi reset password:", err);
      console.error("Error response:", err.response?.data);
      alert("Không thể reset mật khẩu! Vui lòng thử lại.");
    }
  };

  // ✅ Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation chỉ khi tạo mới
    if (!isEdit) {
      if (!formData.username || !formData.email || !formData.fullName) {
        setError("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      // Bắt buộc chọn vai trò khi tạo mới
      if (!formData.role) {
        setError("Vui lòng chọn vai trò!");
        return;
      }

      // Nếu là STAFF hoặc MANAGER thì phải có dealerId khi tạo mới
      if ((formData.role === "STAFF" || formData.role === "MANAGER") && !formData.dealerId) {
        setError("Vui lòng chọn đại lý cho Staff/Manager!");
        return;
      }
    } else {
      // Khi sửa, chỉ validate nếu thay đổi role và cần dealerId
      if (formData.role && (formData.role === "STAFF" || formData.role === "MANAGER") && !formData.dealerId) {
        setError("Vui lòng chọn đại lý cho Staff/Manager!");
        return;
      }
    }

    try {
      if (isEdit && selectedUser) {
        // Kiểm tra xem có thay đổi trạng thái isActive không
        const isActiveChanged = selectedUser.isActive !== formData.isActive;
        const oldIsActive = selectedUser.isActive;
        const newIsActive = formData.isActive === true;
        
        console.log("🔄 Kiểm tra thay đổi isActive:");
        console.log("  - isActive cũ:", oldIsActive);
        console.log("  - isActive mới:", newIsActive);
        console.log("  - Có thay đổi:", isActiveChanged);
        
        // Chỉ gửi các trường đã thay đổi hoặc các trường cần thiết
        const updateData = {};
        
        // Chỉ gửi fullName nếu có thay đổi hoặc có giá trị
        if (formData.fullName && formData.fullName !== selectedUser.fullName) {
          updateData.fullName = formData.fullName;
        }
        
        // Chỉ gửi phone nếu có thay đổi
        if (formData.phone !== selectedUser.phone) {
          updateData.phone = formData.phone || null;
        }
        
        // Chỉ gửi email nếu có thay đổi
        if (formData.email && formData.email !== selectedUser.email) {
          updateData.email = formData.email;
        }
        
        // Luôn gửi role khi edit (để đảm bảo backend cập nhật đúng)
        // Backend có thể dùng userType thay vì role
        // Ưu tiên role từ formData, nếu không có thì dùng role từ selectedUser
        if (formData.role && formData.role !== "") {
          updateData.role = formData.role;
          updateData.userType = formData.role; // Backend có thể dùng userType
        } else if (selectedUser.role && selectedUser.role !== "") {
          // Nếu formData không có role nhưng selectedUser có, vẫn gửi để đảm bảo không bị mất
          updateData.role = selectedUser.role;
          updateData.userType = selectedUser.role; // Backend có thể dùng userType
        }
        
        // Luôn gửi dealerId nếu có giá trị (để đảm bảo backend cập nhật đúng)
        if (formData.dealerId && formData.dealerId !== "") {
          updateData.dealerId = formData.dealerId;
        } else if (formData.dealerId === "" && selectedUser.dealer?.dealerId) {
          // Nếu xóa dealerId (chọn rỗng), gửi null
          updateData.dealerId = null;
        }
        
        // Luôn gửi isActive vì có thể thay đổi
        updateData.isActive = newIsActive;
        
        console.log("📤 Dữ liệu sẽ gửi lên (chỉ các trường thay đổi):", updateData);
        console.log("📤 Role trong updateData:", updateData.role, "formData.role:", formData.role, "selectedUser.role:", selectedUser.role);
        
        console.log("📤 Cập nhật user - userId:", selectedUser.userId);
        console.log("📤 Dữ liệu gửi lên:", JSON.stringify(updateData, null, 2));
        console.log("📤 isActive value:", updateData.isActive, "type:", typeof updateData.isActive);
        
        // Nếu thay đổi trạng thái isActive, thử dùng API riêng
        if (isActiveChanged) {
          if (!newIsActive && oldIsActive) {
            // Deactivate user
            console.log("⚠️ Đang deactivate user, dùng API deactivateUser...");
            try {
              const deactivateRes = await userAPI.deactivateUser(selectedUser.userId);
              console.log("✅ Deactivate response:", deactivateRes);
            } catch (deactivateErr) {
              console.warn("⚠️ Deactivate API không hoạt động, dùng updateUser:", deactivateErr);
              // Tiếp tục dùng updateUser
            }
          } else if (newIsActive && !oldIsActive) {
            // Activate user - có thể cần API riêng hoặc dùng updateUser với isActive: true
            console.log("⚠️ Đang activate user...");
          }
        }
        
        // Gọi updateUser để cập nhật các thông tin khác
        console.log("📤 Gọi updateUser với dữ liệu:", updateData);
        const updateRes = await userAPI.updateUser(selectedUser.userId, updateData);
        
        console.log("✅ Response từ API update:", updateRes);
        console.log("✅ Response data:", updateRes.data);
        console.log("✅ Response status:", updateRes.status);
        
        // Kiểm tra response
        if (updateRes.data) {
          console.log("✅ User sau khi update:", updateRes.data);
          if (updateRes.data.isActive !== undefined) {
            console.log("✅ isActive trong response:", updateRes.data.isActive);
          } else {
            console.warn("⚠️ Response không có isActive!");
          }
        } else {
          console.warn("⚠️ Response không có data!");
        }
        
        alert("Cập nhật tài khoản thành công!");
        setShowPopup(false);
        setError("");
        
        // Fetch lại user từ API để lấy đầy đủ thông tin (bao gồm dealer object)
        try {
          const refreshedUserRes = await userAPI.getUser(selectedUser.userId);
          const refreshedUser = refreshedUserRes.data;
          console.log("✅ User sau khi refresh từ API:", refreshedUser);
          
          // Cập nhật state với user đầy đủ từ API
          setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
              if (u.userId === selectedUser.userId) {
                // Merge data từ API với data đã update
                // Đảm bảo role được giữ lại (từ formData nếu có, hoặc từ refreshedUser, hoặc từ user cũ)
                const preservedRole = formData.role || refreshedUser.role || u.role || selectedUser.role;
                
                // Lưu role vào cache
                if (preservedRole) {
                  setRoleCache(prev => {
                    const newCache = { ...prev, [u.userId]: preservedRole };
                    try {
                      localStorage.setItem('userRoleCache', JSON.stringify(newCache));
                    } catch (e) {
                      console.warn("Không thể lưu role vào localStorage:", e);
                    }
                    return newCache;
                  });
                }
                
                const updatedUser = {
                  ...u,
                  ...refreshedUser,
                  ...updateData,
                  isActive: newIsActive,
                  // Đảm bảo role luôn được giữ lại
                  role: preservedRole,
                  // Đảm bảo dealer object được giữ nguyên từ API
                  dealer: refreshedUser.dealer || u.dealer
                };
                console.log("🔄 Cập nhật user trong state với dealer và role:", {
                  userId: u.userId,
                  username: u.username,
                  role: updatedUser.role,
                  dealerId: updatedUser.dealerId,
                  dealerName: updatedUser.dealer?.dealerName,
                  isActive: updatedUser.isActive
                });
                return updatedUser;
              }
              return u;
            });
            console.log("✅ Đã cập nhật state với dealer và role từ API");
            return updatedUsers;
          });
        } catch (refreshErr) {
          console.warn("⚠️ Không thể fetch lại user từ API, cập nhật state với dealer từ danh sách:", refreshErr);
          // Fallback: cập nhật state với dealer từ danh sách dealers đã có
          setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
              if (u.userId === selectedUser.userId) {
                // Tìm dealer từ danh sách dealers
                const dealer = dealers.find(d => d.dealerId === formData.dealerId);
                // Đảm bảo role được giữ lại
                const preservedRole = formData.role || u.role || selectedUser.role;
                const updatedUser = {
                  ...u,
                  ...updateData,
                  isActive: newIsActive,
                  // Đảm bảo role luôn được giữ lại
                  role: preservedRole,
                  dealer: dealer ? { dealerId: dealer.dealerId, dealerName: dealer.dealerName } : null
                };
                console.log("🔄 Cập nhật user trong state với dealer và role từ danh sách:", {
                  userId: u.userId,
                  username: u.username,
                  role: updatedUser.role,
                  dealerId: updatedUser.dealerId,
                  dealerName: updatedUser.dealer?.dealerName,
                  isActive: updatedUser.isActive
                });
                return updatedUser;
              }
              return u;
            });
            console.log("✅ Đã cập nhật state với dealer và role từ danh sách");
            return updatedUsers;
          });
        }
      } else {
        // Tạo tài khoản mới
        let res;
        let password = "";
        
        try {
          // Chuẩn bị dữ liệu theo format backend yêu cầu
          // Backend cần: username, email, password, firstName, lastName, phone, address
          // Và có thể cần: role, dealerId, isActive
          
          // Tách fullName thành firstName và lastName
          const fullNameParts = (formData.fullName || "").trim().split(/\s+/);
          const firstName = fullNameParts[0] || "";
          const lastName = fullNameParts.slice(1).join(" ") || "";
          
          const userData = {
            username: formData.username,
            email: formData.email,
            firstName: firstName,
            lastName: lastName,
            phone: formData.phone || "",
            address: "", // Backend có thể yêu cầu, để trống nếu không có
            role: formData.role,
            userType: formData.role, // Backend có thể dùng userType thay vì role
            isActive: formData.isActive !== false
          };
          
          // Thêm password nếu có (nhưng sẽ không gửi, sẽ reset sau)
          // const hasPassword = formData.password && formData.password.trim() !== "";
          
          // Validate dữ liệu trước khi gửi
          if (!userData.username || userData.username.trim() === "") {
            throw new Error("Username không được để trống!");
          }
          if (!userData.email || userData.email.trim() === "") {
            throw new Error("Email không được để trống!");
          }
          if (!userData.role || userData.role.trim() === "") {
            throw new Error("Vai trò không được để trống!");
          }
          if (!firstName || firstName.trim() === "") {
            throw new Error("Họ và tên không được để trống!");
          }
          
          // Backend yêu cầu dealerId cho tất cả user không phải ADMIN
          // dealerId phải là UUID (36 ký tự), không phải số
          if (userData.role !== "ADMIN") {
            if (!formData.dealerId || formData.dealerId === "" || formData.dealerId === null || formData.dealerId === undefined) {
              const roleName = userData.role === "STAFF" ? "Nhân viên đại lý" : 
                              userData.role === "MANAGER" ? "Quản lý đại lý" : 
                              userData.role === "EVM_STAFF" ? "Nhân viên EVM" : userData.role;
              throw new Error(`Vui lòng chọn đại lý cho ${roleName}!`);
            }
            
            // Giữ dealerId là string (UUID), không convert sang số
            // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 ký tự)
            const dealerIdStr = String(formData.dealerId).trim();
            if (dealerIdStr.length === 0) {
              throw new Error("Đại lý không hợp lệ!");
            }
            userData.dealerId = dealerIdStr; // Giữ nguyên string UUID
          }
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(userData.email)) {
            throw new Error("Email không đúng định dạng!");
          }
          
          // Backend yêu cầu rawPassword không được null
          // Nếu có password trong form, gửi đi; nếu không, tạo password tạm thời
          if (formData.password && formData.password.trim() !== "") {
            userData.password = formData.password;
            userData.rawPassword = formData.password; // Backend có thể cần rawPassword
          } else {
            // Tạo password tạm thời, sẽ reset sau khi tạo user
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
            userData.password = tempPassword;
            userData.rawPassword = tempPassword;
          }
          
          // Đảm bảo isActive là boolean
          userData.isActive = userData.isActive === true || userData.isActive === "true" || userData.isActive === 1;
          
          console.log("📤 Tạo user theo format backend yêu cầu...");
          console.log("📤 Final userData to send:", JSON.stringify(userData, null, 2));
          console.log("📤 dealerId value:", userData.dealerId, "Type:", typeof userData.dealerId);
          console.log("📤 role value:", userData.role);
          console.log("📤 firstName:", firstName, "lastName:", lastName);
          
          // Đảm bảo dealerId có giá trị hợp lệ trước khi gửi (phải là UUID string)
          if (userData.role !== "ADMIN") {
            if (!userData.dealerId || userData.dealerId === "" || typeof userData.dealerId !== "string") {
              throw new Error("Đại lý không hợp lệ! Vui lòng chọn lại đại lý.");
            }
          }
          
          // Thử dùng createUserFromDTO nếu createUser không hoạt động
          // Hoặc có thể backend cần format khác
          try {
            res = await userAPI.createUser(userData);
            console.log("✅ Create user response:", res);
          } catch (createErr) {
            // Nếu lỗi 400 và có dealerId, thử dùng createUserFromDTO
            if (createErr.response?.status === 400 && userData.dealerId) {
              console.log("⚠️ createUser failed, thử createUserFromDTO...");
              console.log("📤 Dữ liệu gửi qua DTO:", JSON.stringify(userData, null, 2));
              res = await userAPI.createUserFromDTO(userData);
              console.log("✅ Create user from DTO response:", res);
            } else {
              throw createErr;
            }
          }
          
          // Lấy password từ response hoặc dùng password đã gửi
          // Ưu tiên lấy từ create response, nếu không có thì dùng password đã gửi
          if (res.data?.password) {
            password = res.data.password;
          } else if (res.data?.newPassword) {
            password = res.data.newPassword;
          } else if (res.data?.rawPassword) {
            password = res.data.rawPassword;
          } else if (res.data?.data?.password) {
            password = res.data.data.password;
          } else if (res.data?.user?.password) {
            password = res.data.user.password;
          } else {
            // Nếu không có trong response, dùng password đã gửi
            password = userData.password || userData.rawPassword || formData.password;
            console.log("📝 Dùng password đã gửi:", password);
          }
          
          // Đảm bảo password luôn có giá trị
          if (!password || password.trim() === "") {
            console.error("❌ Password rỗng! Đang reset password...");
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              const resetRes = await userAPI.resetPasswordByUsername(formData.username);
              console.log("✅ Reset password response:", resetRes);
              
              if (resetRes.data?.password) {
                password = resetRes.data.password;
              } else if (resetRes.data?.newPassword) {
                password = resetRes.data.newPassword;
              } else if (resetRes.data?.data?.password) {
                password = resetRes.data.data.password;
              } else {
                alert("⚠️ Tài khoản đã được tạo nhưng không thể lấy mật khẩu. Vui lòng sử dụng chức năng 'Reset mật khẩu' sau.");
                fetchUsers();
                return;
              }
            } catch (resetErr) {
              console.error("❌ Không thể reset password:", resetErr);
              alert("⚠️ Tài khoản đã được tạo nhưng không thể lấy mật khẩu. Vui lòng sử dụng chức năng 'Reset mật khẩu' sau.");
              fetchUsers();
              return;
            }
          }
          
          console.log("✅ Final password to display:", password);
          
          // Kiểm tra response có chứa user data không
          const createdUser = res.data?.user || res.data?.data || res.data;
          console.log("📥 User được tạo từ API response:", createdUser);
          console.log("📥 Role trong response:", createdUser?.role, "formData.role:", formData.role);
          
          // Đảm bảo role được lưu vào state ngay sau khi tạo
          if (createdUser && createdUser.userId) {
            // Lưu role vào cache
            const userRole = createdUser.role || formData.role;
            if (userRole) {
              setRoleCache(prev => {
                const newCache = { ...prev, [createdUser.userId]: userRole };
                try {
                  localStorage.setItem('userRoleCache', JSON.stringify(newCache));
                } catch (e) {
                  console.warn("Không thể lưu role vào localStorage:", e);
                }
                return newCache;
              });
            }
            
            // Thêm user mới vào state với role từ formData (vì API có thể không trả về role)
            setUsers(prevUsers => {
              const newUser = {
                ...createdUser,
                role: userRole, // Ưu tiên role từ API, nếu không có thì dùng từ formData
                dealer: createdUser.dealer || (formData.dealerId ? dealers.find(d => d.dealerId === formData.dealerId) : null)
              };
              console.log("✅ Thêm user mới vào state với role:", newUser.role);
              return [newUser, ...prevUsers];
            });
          }
          
          setPasswordInfo({
            username: formData.username,
            password: password,
            role: formData.role || ""
          });
          setShowPasswordModal(true);
          setShowPopup(false);
          setError("");
          
          // Fetch lại để đảm bảo data đồng bộ, nhưng đã thêm vào state rồi nên không cần đợi
          fetchUsers();
        } catch (createErr) {
          console.error("❌ Lỗi khi tạo user:", createErr);
          console.error("Error response:", createErr.response?.data);
          throw createErr;
        }
      }
    } catch (err) {
      console.error("Lỗi khi lưu user:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Lấy thông báo lỗi chi tiết từ backend
      let errorMsg = "Không thể lưu tài khoản!";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Kiểm tra các loại lỗi phổ biến
        if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Lỗi validation từ Spring Boot
          errorMsg = errorData.errors.map(e => e.defaultMessage || e.message).join(", ");
        } else if (errorData.details) {
          errorMsg = errorData.details;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      // Thêm thông tin status code
      if (err.response?.status === 400) {
        errorMsg = `Lỗi 400 - Dữ liệu không hợp lệ: ${errorMsg}`;
      } else if (err.response?.status === 409) {
        errorMsg = `Lỗi 409 - Tài khoản đã tồn tại: ${errorMsg}`;
      } else if (err.response?.status === 500) {
        errorMsg = `Lỗi 500 - Lỗi server: ${errorMsg}`;
      }
      
      setError(errorMsg);
      alert(`❌ Lỗi: ${errorMsg}\n\nVui lòng kiểm tra:\n- Username đã tồn tại chưa?\n- Email đúng format chưa?\n- Đã chọn đại lý chưa? (nếu là STAFF/MANAGER)\n- Tất cả trường bắt buộc đã điền chưa?`);
    }
  };

  // ✅ Lấy tên role
  const getRoleName = (role) => {
    if (!role || role === null || role === undefined || role === "") {
      return "—";
    }
    const roles = {
      "ADMIN": "Quản trị viên",
      "EVM_STAFF": "Nhân viên EVM",
      "MANAGER": "Quản lý đại lý",
      "STAFF": "Nhân viên đại lý"
    };
    return roles[role] || role;
  };

  // ✅ Lọc users theo role
  const filteredUsers = users.filter(u => {
    const keyword = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.fullName?.toLowerCase().includes(keyword) ||
      getRoleName(u.role)?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="customer">
      <div className="title-customer">Quản lý tài khoản</div>

      <div className="title2-customer">
        <h2>Danh sách tài khoản</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Tạo tài khoản</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>HỌ TÊN</th>
              <th>EMAIL</th>
              <th>SĐT</th>
              <th>VAI TRÒ</th>
              <th>ĐẠI LÝ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.userId}>
                  <td>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    {(() => {
                      // Thử lấy role từ nhiều nguồn (backend có thể dùng userType)
                      let displayRole = u.role || u.userType;
                      if (!displayRole || displayRole === "" || displayRole === null || displayRole === undefined) {
                        displayRole = u.userRole || u.roles?.[0] || null;
                        // Chỉ log khi tìm thấy role từ nguồn khác
                        if (displayRole) {
                          console.log(`⚠️ User ${u.username}: dùng role từ userRole/roles:`, displayRole);
                        }
                      }
                      
                      const roleName = getRoleName(displayRole);
                      const hasValidRole = displayRole && displayRole !== "" && displayRole !== null && displayRole !== undefined;
                      
                      // Chỉ log cảnh báo khi không có role (không log mỗi lần render)
                      if (!hasValidRole && !u._roleLogged) {
                        console.warn(`❌ User ${u.username} KHÔNG CÓ ROLE!`, {
                          role: u.role,
                          userRole: u.userRole,
                          roles: u.roles,
                          displayRole: displayRole
                        });
                        u._roleLogged = true; // Đánh dấu đã log để tránh spam
                      }
                      
                      return (
                        <span style={{
                          background: hasValidRole ? (
                            displayRole === "ADMIN" ? "#fef3c7" : 
                            displayRole === "EVM_STAFF" ? "#dbeafe" :
                            displayRole === "MANAGER" ? "#d1fae5" : "#e0e7ff"
                          ) : "#fee2e2",
                          color: hasValidRole ? (
                            displayRole === "ADMIN" ? "#92400e" :
                            displayRole === "EVM_STAFF" ? "#1e40af" :
                            displayRole === "MANAGER" ? "#065f46" : "#3730a3"
                          ) : "#dc2626",
                          padding: "5px 8px",
                          borderRadius: "5px",
                          fontSize: "12px",
                          fontWeight: hasValidRole ? "normal" : "bold"
                        }}>
                          {roleName}
                        </span>
                      );
                    })()}
                  </td>
                  <td>{u.dealer?.dealerName || "—"}</td>
                  <td>
                    <span style={{
                      background: (u.isActive === true) ? "#dcfce7" : "#fee2e2",
                      color: (u.isActive === true) ? "#16a34a" : "#dc2626",
                      padding: "5px 8px",
                      borderRadius: "5px"
                    }}>
                      {(u.isActive === true) ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(u)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(u)}><FaPen /></button>
                    <button 
                      className="icon-btn" 
                      onClick={() => handleResetPassword(u)}
                      style={{ background: "#f59e0b", color: "white" }}
                      title="Reset mật khẩu"
                    >
                      <FaKey />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(u.userId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>Không có dữ liệu tài khoản</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: "600px" }}>
            <h2>{isEdit ? "Sửa tài khoản" : "Tạo tài khoản mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input 
                  name="username" 
                  placeholder="Username *" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  disabled={isEdit}
                  required={!isEdit}
                />
                <input 
                  name="email" 
                  type="email"
                  placeholder={isEdit ? "Email" : "Email *"} 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required={!isEdit}
                />
                <input 
                  name="fullName" 
                  placeholder={isEdit ? "Họ và tên" : "Họ và tên *"} 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  required={!isEdit}
                />
                <input 
                  name="phone" 
                  placeholder="Số điện thoại" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                {!isEdit && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                      Mật khẩu *
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input 
                        name="password" 
                        type="text"
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
                          setFormData({...formData, password: newPassword});
                        }}
                        style={{
                          padding: "10px 15px",
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}
                      >
                        🔄 Tạo tự động
                      </button>
                    </div>
                    <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                      💡 Nhập mật khẩu tùy chỉnh hoặc nhấn "Tạo tự động" để hệ thống tạo mật khẩu ngẫu nhiên. Mật khẩu sẽ được hiển thị sau khi tạo tài khoản thành công.
                    </small>
                  </div>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Vai trò *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={e => {
                      setFormData({...formData, role: e.target.value, dealerId: ""});
                      // Tạo password mới khi đổi role (nếu chưa có và không phải edit)
                      if (!formData.password && !isEdit) {
                        const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
                        setFormData(prev => ({...prev, password: newPassword}));
                      }
                    }}
                    required={!isEdit}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="STAFF">Nhân viên đại lý</option>
                    <option value="MANAGER">Quản lý đại lý</option>
                    <option value="EVM_STAFF">Nhân viên EVM</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                  <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                    💡 Chọn vai trò phù hợp cho tài khoản. Nhân viên đại lý và Quản lý đại lý cần chọn đại lý.
                  </small>
                </div>
                {/* Backend yêu cầu dealerId cho tất cả user không phải ADMIN */}
                {formData.role && formData.role !== "ADMIN" && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                      Đại lý *
                    </label>
                    <select
                      name="dealerId"
                      value={formData.dealerId}
                      onChange={e => setFormData({...formData, dealerId: e.target.value})}
                      required={!isEdit}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                    >
                      <option value="">-- Chọn đại lý --</option>
                      {dealers.map(d => (
                        <option key={d.dealerId} value={d.dealerId}>{d.dealerName}</option>
                      ))}
                    </select>
                    <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                      💡 Tất cả user (trừ Admin) đều cần chọn đại lý
                    </small>
                  </div>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", gridColumn: "1 / -1" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive === true}
                    onChange={e => {
                      const newValue = e.target.checked;
                      console.log("🔄 Thay đổi isActive:", newValue, "từ", formData.isActive);
                      setFormData({...formData, isActive: newValue});
                    }}
                  />
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {formData.isActive ? "✅ Đang hoạt động" : "❌ Tạm ngừng"}
                  </span>
                </label>
              </div>
              {error && <span className="error">{error}</span>}
              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hiển thị mật khẩu */}
      {showPasswordModal && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowPasswordModal(false); }}>
          <div className="popup-box" style={{ maxWidth: "500px" }}>
            <h2>🔐 Thông tin đăng nhập</h2>
            <div style={{ padding: "20px", background: "#f3f4f6", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ marginBottom: "15px" }}>
                <b>Username:</b> 
                <span style={{ 
                  background: "#fff", 
                  padding: "8px 12px", 
                  borderRadius: "4px", 
                  display: "inline-block",
                  marginLeft: "10px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1e40af"
                }}>
                  {passwordInfo.username}
                </span>
              </p>
              {passwordInfo.role && (
                <p style={{ marginBottom: "15px" }}>
                  <b>Vai trò:</b> 
                  <span style={{ 
                    background: "#fff", 
                    padding: "8px 12px", 
                    borderRadius: "4px", 
                    display: "inline-block",
                    marginLeft: "10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#7c3aed"
                  }}>
                    {getRoleDisplayName(passwordInfo.role)}
                  </span>
                </p>
              )}
              <p style={{ marginBottom: "15px" }}>
                <b>Mật khẩu:</b> 
                <span style={{ 
                  background: "#fff", 
                  padding: "8px 12px", 
                  borderRadius: "4px", 
                  display: "inline-block",
                  marginLeft: "10px",
                  fontFamily: "monospace",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#059669",
                  letterSpacing: "1px"
                }}>
                  {passwordInfo.password}
                </span>
              </p>
              <div style={{ 
                background: "#fef3c7", 
                padding: "12px", 
                borderRadius: "6px",
                border: "1px solid #fbbf24"
              }}>
                <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
                  ⚠️ <b>Lưu ý quan trọng:</b> Vui lòng lưu lại thông tin này ngay bây giờ. 
                  Mật khẩu sẽ không hiển thị lại sau khi đóng cửa sổ này!
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                className="btn-close" 
                onClick={() => {
                  if (window.confirm("Bạn đã lưu thông tin đăng nhập chưa?")) {
                    setShowPasswordModal(false);
                  }
                }}
                style={{ 
                  background: "#059669", 
                  color: "white", 
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Đã lưu - Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedUser && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin tài khoản</h2>
            <p><b>Username:</b> {selectedUser.username}</p>
            <p><b>Họ tên:</b> {selectedUser.fullName}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>SĐT:</b> {selectedUser.phone || "—"}</p>
            <p><b>Vai trò:</b> {getRoleName(selectedUser.role)}</p>
            <p><b>Đại lý:</b> {selectedUser.dealer?.dealerName || "—"}</p>
            <p><b>Trạng thái:</b> {selectedUser.isActive ? "Hoạt động" : "Ngừng"}</p>
            <p><b>Ngày tạo:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : "—"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

