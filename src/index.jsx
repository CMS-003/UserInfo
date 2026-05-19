import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio';
import { User } from './user'
import './index.css'
import UserRound from './asserts/user-round.svg?react';
import Github from './asserts/github.svg?react';
import Google from './asserts/google.svg?react';
import Alipay from './asserts/alipay.svg?react';
import Weibo from './asserts/weibo.svg?react';

export { User } from './user'

window.addEventListener('pageshow', (event) => {
  // event.persisted 为 true 表示页面是从 BFCache（往返缓存）中恢复的
  const navLoading = document.getElementById('navLoading');
  if (navLoading) {
    navLoading.style.display = 'none';
  }
});

// 切换 登录 / 注册 模式
function switchTab(mode) {
  const btns = document.querySelectorAll('.tab-btn');
  // 更新 Tab 样式
  btns[0].classList.toggle('active', mode === 'login');
  btns[1].classList.toggle('active', mode === 'register');
  const loginForm = document.querySelector('#loginForm')
  const registerForm = document.querySelector('#registerForm')
  if (mode === 'login') {
    loginForm.style.display = 'block'
    registerForm.style.display = 'none'
  } else {
    loginForm.style.display = 'none'
    registerForm.style.display = 'block'
  }
}

// 提交逻辑
async function handleLogin(event, cb) {
  event.preventDefault(); // 阻止表单刷新

  const data = {
    account: document.getElementById('login-account').value.trim(),
    password: document.getElementById('login-pass').value.trim(),
  };
  const submitBtn = document.getElementById('loginBtn');
  submitBtn.disabled = true;

  try {
    const err = await User.login({
      type: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(data.account) ? 'email' : 'account',
      account: data.account,
      value: data.password
    });
    if (err) {
      alert(err)
    } else {
      cb && cb('login')
    }
  } catch (error) {
    console.log(error)
  } finally {
    submitBtn.disabled = false;
  }
}
async function handleRegister(event, cb) {
  event.preventDefault(); // 阻止表单刷新

  const data = {
    password: document.getElementById('register-pass').value.trim(),
    account: document.getElementById('email').value.trim(),
    type: 'email',
    code: document.querySelector('#verify-code').value.trim(),
  };
  const submitBtn = document.getElementById('registerBtn');
  submitBtn.disabled = true;

  try {
    const success = await User.register(data);
    if (!success) {
      alert('注册失败')
    } else {
      cb && cb('register')
    }
  } catch (error) {
    console.log(error)
  } finally {
    submitBtn.disabled = false;
  }
}

let timer = null;
let seconds = 0;
function countdown() {
  seconds = 60;
  timer = setInterval(() => {
    if (seconds > 0) {
      seconds -= 1;
      document.querySelector('#send-code').innerHTML = seconds + 's'
    } else {
      clearInterval(timer);
      timer = null;
      document.querySelector('#send-code').innerHTML = '发送'
    }
  }, 1000)
}
function sendCode(e) {
  if (e.target.disabled) {
    return;
  }
  e.target.disabled = true;
  countdown()
}

function authorize(app) {
  const navLoading = document.getElementById('navLoading');
  if (navLoading) {
    navLoading.style.display = 'block';
  }
  setTimeout(() => {
    window.location.href = `https://jiayou.work/gw/user/sns/${app}/authorize?redirect_url=${window.location.href}`
  }, 200);
}

const UserInfo = ({ afterLogin, afterLogout }) => {
  const state = useSnapshot(User)
  const [showLogin, setShowLogin] = useState(false)
  const [isRefreshProfile, setIsRefreshProfile] = useState(false)
  const [isRefreshToken, setIsRefreshToken] = useState(false)
  useEffect(() => {
    if (isRefreshToken) {
      return;
    }
    if (state.refresh_token && !state.access_token) {
      setIsRefreshToken(true)
      User.refreshToken(() => {
        setIsRefreshToken(false)
      })
    }
  }, [state.refresh_token])
  useEffect(() => {
    if (isRefreshProfile) {
      return;
    }
    if (!state.profile && state.access_token) {
      setIsRefreshProfile(true)
      User.refreshProfile(() => {
        setIsRefreshProfile(false)
      })
    }
  }, [state.access_token])
  return <div style={{ display: 'flex' }}>
    {(state.isLogin && state.profile)
      ? (state.profile.avatar ? <img src={state.profile.avatar} style={{ width: 30, height: 30, borderRadius: 30, }} /> : <UserRound width={30} />)
      : <div className='cms__login-btn' onClick={() => setShowLogin(true)}>登录</div>
    }
    {showLogin && (
      <div className="cms__mask">
        <div className="cms__login-modal">
          <div className="modal-content">
            <span style={{ position: 'absolute', top: 5, right: 5, color: '#333', fontSize: 12, cursor: 'pointer' }} onClick={() => setShowLogin(false)}>
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="36100" width="24" height="24"><path d="M572.16 512l183.466667-183.04a42.666667 42.666667 0 1 0-60.586667-60.586667L512 451.84l-183.04-183.466667a42.666667 42.666667 0 0 0-60.586667 60.586667l183.466667 183.04-183.466667 183.04a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586667 0l183.04-183.466667 183.04 183.466667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z" p-id="36101"></path></svg>
            </span>
            <div className="tab-header">
              <button className="tab-btn active" onClick={() => switchTab('login')} >登录</button>
              <button className="tab-btn" onClick={() => switchTab('register')} >注册</button>
            </div>

            <form id="loginForm">
              <div className="input-group">
                <label htmlFor="login-account">账号 / 邮箱</label>
                <input type="text" id="login-account" name="login-account" placeholder="请输入账号或邮箱" required />
              </div>

              <div className="input-group">
                <label htmlFor="login-pass">密码</label>
                <input type="password" id="login-pass" placeholder="请输入密码" required />
              </div>

              <button id="loginBtn" className="submit-btn" onClick={(event) => {
                handleLogin(event, () => {
                  setShowLogin(false)
                  afterLogin && afterLogin()
                })
              }}>立即登录</button>
            </form>
            <form id="registerForm" style={{ display: 'none' }}>

              <div id="emailGroup" className="input-group">
                <label htmlFor="email">邮箱</label>
                <input type="email" id="email" placeholder="请输入有效邮箱" />
              </div>

              <div className="input-group">
                <label htmlFor="register-pass">密码</label>
                <input type="password" id="register-pass" placeholder="请输入密码" required />
              </div>

              <div className="input-group">
                <label htmlFor="verify-code">验证码</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  <input type="text" id="verify-code" placeholder="请输入验证码" required />
                  <button id="send-code" onClick={sendCode}>发送</button>
                </div>

              </div>

              <button id="registerBtn" className="submit-btn" onClick={(event) => {
                handleRegister(event, () => {
                  confirm("已注册,去登录")
                  document.querySelector('#email').value = '';
                  document.querySelector('#register-pass').value = '';
                  document.querySelector('#verify-code').value = '';
                  switchTab('login')
                })
              }}>注册</button>
            </form>
            <div className='cms__menu'>
              <div className='cms__menu-item' onClick={() => authorize('google')}><Google style={{ height: 24 }} /></div>
              <div className='cms__menu-item' onClick={() => authorize('alipay')}><Alipay style={{ height: 24 }} /></div>
              <div className='cms__menu-item' onClick={() => authorize('github')}><Github style={{ height: 24 }} /></div>
              <div className='cms__menu-item' onClick={() => authorize('weibo')}><Weibo style={{ height: 24 }} /></div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
}

export default UserInfo;