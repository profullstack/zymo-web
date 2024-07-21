

export default {
  async post(request) {
        await request.session.destroy();
        return "logged out";
  },
};
