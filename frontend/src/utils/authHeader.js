const authHeader = () => {
    const user = JSON.parse(localStorage.getItem("user")); // You must store user JWT after login

    if (user && user.token) {
        return { Authorization: "Bearer " + user.token };
    } else {
        return {};
    }
};

export default authHeader;
