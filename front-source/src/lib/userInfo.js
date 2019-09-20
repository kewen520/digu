/**
 * @return {object}
 */
export const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("USER_INFO"));
  } catch (e) {
    return {};
  }
};
