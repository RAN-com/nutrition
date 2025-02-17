import { useAppSelector } from '@renderer/redux/store/hook'
import moment from 'moment'
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Auth = () => {
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      if (!user?.subscription) {
        navigate('/pricing')
      } else if (moment(user?.subscription?.valid_till).isAfter(moment())) {
        navigate('/pricing')
      } else {
        navigate('/home')
      }
    }
  }, [user])

  return <Outlet />
}

export default Auth
