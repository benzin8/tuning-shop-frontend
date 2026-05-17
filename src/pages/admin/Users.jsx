import { useState, useEffect } from 'react'
import { User, Calendar } from 'lucide-react'
import { getAllUsers, updateRole, getRoles } from '../../api/users'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    Promise.all([getAllUsers(), getRoles()])
      .then(([u, r]) => { setUsers(u.data); setRoles(r.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleRole = async (userId, roleId) => {
    setUpdating(userId)
    try {
      const res = await updateRole(userId, parseInt(roleId))
      setUsers(prev => prev.map(u => u.user_id === userId ? res.data : u))
    } finally { setUpdating(null) }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Пользователи</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-5 py-3 font-medium">Пользователь</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Телефон</th>
                  <th className="text-left px-5 py-3 font-medium">Роль</th>
                  <th className="text-left px-5 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u.user_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                          <User size={13} className="text-orange-400" />
                        </div>
                        <span className="text-gray-200 font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{u.phone ?? '—'}</td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role.role_id}
                        disabled={updating === u.user_id}
                        onChange={e => handleRole(u.user_id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${u.role.role_name === 'admin' ? 'bg-orange-500/15 text-orange-400' : 'bg-gray-700 text-gray-300'}`}
                      >
                        {roles.map(r => (
                          <option key={r.role_id} value={r.role_id} className="bg-gray-800 text-gray-200">{r.role_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(u.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
