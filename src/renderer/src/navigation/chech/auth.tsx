import { CenterUser } from '@renderer/types/user'
import moment from 'moment'
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

type Props = {
  user: CenterUser | null
}

const CheckAuth = ({ user }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isPricingRoute = location.pathname === '/pricing' || location.pathname.startsWith('/pricing/')
  const hasActiveSubscription = user?.subscription
    ? moment(user.subscription.valid_till).isSameOrAfter(moment())
    : false

  React.useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true })
      return
    }

    if (!hasActiveSubscription && !isPricingRoute) {
      navigate('/pricing', { replace: true })
    }
  }, [user, hasActiveSubscription, isPricingRoute, navigate])

  if (!user || (!hasActiveSubscription && !isPricingRoute)) {
    return null
  }

  return <Outlet />
}

export default CheckAuth
