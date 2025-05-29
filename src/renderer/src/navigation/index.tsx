import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import CheckAuth from './chech/auth'
import AuthLogin from '@renderer/pages/auth/login'
import AuthCreate from '@renderer/pages/auth/create'
import { useAppSelector } from '@renderer/redux/store/hook'
import Pricing from '@renderer/pages/pricing'
import NotFound from './error'
import AuthReset from '@renderer/pages/auth/reset'
import Auth from '@renderer/pages/auth'
import Home from '@renderer/pages/home'
import LayoutV2 from '@renderer/components/layout'
import CustomerPage from '@renderer/pages/customer'
import ProductsPage from '@renderer/pages/products'
import VisitorPage from '../pages/visitor/index'
import StaffPage from '@renderer/pages/staffs'
import AboutStaff from '@renderer/pages/staffs/about'
import BillingPage from '@renderer/pages/billing'
import BillingModal from '@renderer/pages/billing/billing-modal'
import NoInternet from '@renderer/components/modal/no-internet'
import CustomerDetails from '@renderer/pages/customer/details'
import ProfilePage from '@renderer/pages/profile'
import EditProfile from '@renderer/pages/profile/edit'
import CustomerRecords from '@renderer/pages/customer/records'
import MarathonPage from '@renderer/pages/marathon'
import Notifications from '@renderer/pages/notifications'
import MarathonDetails from '@renderer/pages/marathon/marathon-details'
import PhotoGallery from '@renderer/pages/photo-gallery'
import CustomerPhotoGallery from '@renderer/pages/customer/photo-gallery'
import Posts from '@renderer/pages/posts'
import PostDetails from '@renderer/pages/posts/details'

const Navigation = () => {
  const user = useAppSelector((s) => s.auth.user)
  const router = createHashRouter([
    {
      element: <NoInternet />,
      children: [
        {
          element: <CheckAuth user={user || null} />,
          children: [
            {
              element: <LayoutV2 />,
              children: [
                {
                  path: '/home',
                  element: <Home />
                },
                {
                  path: '/marathon',
                  children: [
                    {
                      index: true,
                      element: <MarathonPage />
                    },
                    {
                      path: ':marathonId',
                      element: <MarathonDetails />
                    }
                  ]
                },
                {
                  path: '/photo_gallery',
                  element: <PhotoGallery />
                },
                {
                  path: '/customers',
                  children: [
                    {
                      index: true,
                      element: <CustomerPage />
                    },
                    {
                      path: ':customerId',
                      element: <CustomerDetails />,
                      children: [
                        {
                          path: 'records',
                          element: <CustomerRecords />
                        },
                        {
                          path: 'photo_gallery',
                          element: <CustomerPhotoGallery />
                        }
                      ]
                    }
                  ]
                },
                {
                  path: '/products',
                  element: <ProductsPage />
                },
                {
                  path: '/marathon',
                  element: <h1>Marathon</h1>
                },
                {
                  path: '/visitors',
                  element: <VisitorPage />
                },
                {
                  path: '/staffs',
                  children: [
                    {
                      index: true,
                      element: <StaffPage />
                    },
                    {
                      path: ':staff_id',
                      element: <AboutStaff />
                    }
                  ]
                },
                {
                  path: '/profile',
                  element: <ProfilePage />,
                  children: [
                    {
                      index: true,
                      element: <EditProfile />
                    }
                    // {
                    //   path: 'settings',
                    //   element: <p>Will be available soon</p>
                    // }
                  ]
                },
                {
                  path: '/appointments',
                  element: <h1>Appointments</h1>
                },
                {
                  path: '/notifications',
                  element: <Notifications />
                },
                {
                  path: '/billing',
                  element: <BillingPage />,
                  children: [
                    {
                      path: ':orderId',
                      element: <BillingModal />
                    }
                  ]
                },
                {
                  // nutritional-information, work
                  path: '/posts/:type',
                  element: <Posts />
                },
                {
                  path: '/post-details/:type/:id',
                  element: <PostDetails />
                }
              ]
            },
            {
              path: '/pricing',
              element: <Pricing />
            }
          ]
        },
        {
          path: '/auth',
          element: <Auth />,
          children: [
            {
              index: true,
              path: 'login',
              element: <AuthLogin />
            },
            {
              path: 'create',
              element: <AuthCreate />
            },
            {
              path: 'reset',
              element: <AuthReset />
            }
          ]
        },
        {
          path: '/',
          element: <Navigate to={'/home'} replace={true} />
        },
        {
          path: '*',
          element: <NotFound />
        }
      ]
    }
  ])
  return <RouterProvider router={router} />
}

export default Navigation
