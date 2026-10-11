import { useAppSelector } from '@renderer/redux/store/hook'
import moment from 'moment'
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Auth = () => {
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const hasActiveSubscription = user?.subscription
    ? moment(user.subscription.valid_till).isSameOrAfter(moment())
    : false

  React.useEffect(() => {
    if (!user) {
      return
    }

    if (hasActiveSubscription) {
      navigate('/home', { replace: true })
      return
    }

    navigate('/pricing', { replace: true })
  }, [user, hasActiveSubscription, navigate])

  return <Outlet />
}

export default Auth
