const express = require('express');
const router = express.Router();

const validateRegister = require('../middlewares/validateRegister');
const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/userController');

router.post('/register', validateRegister, userCtrl.register);
router.post('/login', userCtrl.login);

router.get('/me', auth, userCtrl.getProfile);
router.put('/me', auth, userCtrl.updateProfile);

router.delete('/me', auth, userCtrl.deleteUser);

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    serure: false
  });
  res.json({ message: 'Logout realizado com sucesso.' });
});

router.get('/verify-token', auth, (req, res) => {
  res.json({ valid: true });
});

module.exports = router;