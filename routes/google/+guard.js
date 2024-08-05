import redirect from "primate/handler/redirect";

export default request => {
  const { url: { pathname }, session } = request;

  console.log('loggedIn:', session.get('loggedIn'));

  if (session.get('loggedIn')) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
