const router = express.Router();
const { makeInvoker } require('awilix-express');


function API ({ authService, tokenCookieName }) {

  const deleteCookie = (res) => res.clearCookie(tokenCookieName);;
  const setCookie = (res, value) => res.cookie(tokenCookieName, token, {});


  const requestLogincodeByMail = (req, res) => {
    authService.requestLogincodeByMail(req.params.email)
      .catch(res.jsend.fail)
      .then(logincode => {
        res.jsend.success('Mail away!')
      });
  };


  const authenticateLogincode = (req, res) => {
    authService.authenticateLogincode(req.params.email, req.params.code)
      .catch(res.jsend.fail)
      .then(token => {
        res.jsend.success(token)
      });
  };


  const authenticateToken = (req, res) => {
    // Check header request for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    authService.authenticateToken(token)
      .catch(err => {
        // TODO! Delete token from wherever it was
        res.jsend.fail(err);
      })
      .then(decoded => {
        res.jsend.success(decoded)
      });
  };

  /**
   * Public
   */
  return {
    requestLogincodeByMail: requestLogincodeByMail,
    authenticateLogincode: authenticateLogincode,
    authenticateToken: authenticateToken,
  };
};


const api = makeInvoker(API);

router.get('/:email', api('requestTokenByMail'));
router.get('/:email/:code', api('authenticateToken'));


module.exports = router;