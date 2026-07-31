'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function login() {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      window.location.href = '/admin/analyze';
    } else {
      setMessage('账号或密码错误');
    }
  }

  return (
    <main>
      <h1>CallAI 管理登录</h1>
      <input placeholder="账号" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>登录</button>
      <p>{message}</p>
    </main>
  );
}
