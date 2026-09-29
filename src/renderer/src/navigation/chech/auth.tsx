import { CenterUser } from '@renderer/types/user'
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

type Props = {
  user: CenterUser | null
}

const CheckAuth = ({ user }: Props) => {
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      if (user?.subscription && user?.subscription?.valid_till) {
        const isValid = new Date(user?.subscription?.valid_till).getTime() > new Date().getTime()
        if (!isValid) {
          navigate('/pricing', { replace: true })
          return
        }
      } else {
        navigate('/pricing', { replace: true })
        return
      }
      return
      // navigate(window.location.href/)
    } else {
      navigate('/auth/login')
    }
  }, [user])

  return <Outlet />
  // return user ? (
  //   !!user?.subscription ? (
  //     moment(user?.subscription?.valid_till).isSameOrAfter(moment()) ? (
  //       <Outlet />
  //     ) : (
  //       <Navigate to={'/pricing'} replace={true} />
  //     )
  //   ) : (
  //     <Navigate to={'/pricing'} replace={true} />
  //   )
  // ) : (
  //   <Navigate to={'/auth/login'} replace={true} />
  // )
}

export default CheckAuth
