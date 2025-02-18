import { Button } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'

import { useNavigate } from 'react-router-dom'

// const validationSchema = Yup.object({
//   domain: Yup.string()
//     .matches(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores are allowed.')
//     .min(4, 'Domain must be at least 3 characters')
//     .max(16, 'Domain cannot exceed 50 characters')
//     .required('Domain is required')
// })

const AboutHeader = () => {
  const navigate = useNavigate()
  // const staff = useAppSelector((s) => s.staffs.current_staff)
  // const [assign, setAssign] = React.useState(false)
  // const user = useAppSelector((s) => s.auth.user)
  // const dispatch = useAppDispatch()
  // const assigned_domain = useAppSelector((s) => s.staffs?.current_staff_domain)

  // const formik = useFormik({
  //   initialValues: {
  //     domain: ''
  //   },
  //   validationSchema,
  //   async onSubmit(values) {
  //     if (!staff) return alert('Staff Not found. Try Again')
  //     if (confirm('You cannot change this name. Do you want to continue ?')) {
  //       await assignOrUpdateDomain(values.domain, {
  //         created_by: user?.uid as string,
  //         created_on: moment().format('YYYY-MM-DD'),
  //         is_active: true,
  //         staff_id: staff?.data?.sid
  //       })

  //       await setSubDomainToStaff(staff?.data, values.domain)
  //       await appendSubdomainToRecord(user?.uid as string, values.domain, staff?.data)
  //       const d = await getStaff(user?.uid as string, staff?.data?.sid as string)
  //       if (d.data) {
  //         dispatch(setCurrentStaff(d?.data))
  //       }
  //     }
  //   }
  // })

  // const domainExists = async (e: string) => {
  //   if (!user) return false
  //   const res = await Promise.resolve(checkSubdomain(user?.uid, e))
  //   if (res.status) {
  //     formik.setFieldError('domain', 'Domain Already Exists')
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  // const [loading, setLoading] = React.useState(false)
  // const [isAvailable, setIsAvailable] = React.useState(false)

  return (
    <PageHeader
      sx={{
        alignItems: 'flex-start'
      }}
      start={
        <div>
          <Button
            variant="text"
            disableElevation
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={() => {
              navigate(-1)
            }}
            startIcon={
              <CustomIcon
                stopPropagation={false}
                name={'LUCIDE_ICONS'}
                icon="LuArrowLeft"
                color="primary"
              />
            }
          >
            <CustomTypography textTransform={'none'}>Back</CustomTypography>
          </Button>
        </div>
      }
      // end={
      //   staff?.data.assigned_subdomain ? (
      //     <Link
      //       to={`http://${staff?.data?.assigned_subdomain}.localhost:3000`}
      //       target="_blank"
      //       rel={'noreferrer'}
      //     >
      //       <Button
      //         variant={'text'}
      //         startIcon={<CustomIcon name="LUCIDE_ICONS" icon={'LuLink'} />}
      //         disableElevation
      //         disableFocusRipple
      //         disableRipple
      //         disableTouchRipple
      //         // onClick={() => {
      //         //   const link = `${staff?.data?.assigned_subdomain}.localhost:3000`
      //         //   window.open(link, '_about')
      //         // }}
      //       >
      //         <CustomTypography variant="body2" textTransform={'none'}>
      //           {staff?.data?.assigned_subdomain}
      //         </CustomTypography>
      //       </Button>
      //     </Link>
      //   ) : assign ? (
      //     <div
      //       style={{
      //         display: 'flex'
      //       }}
      //     >
      //       {formik.values.domain.length > 0 ? (
      //         <CustomIcon
      //           name="LUCIDE_ICONS"
      //           icon="LuX"
      //           onClick={() => {
      //             formik.resetForm()
      //             setLoading(false)
      //             setIsAvailable(false)
      //           }}
      //           color={'grey'}
      //           sx={{ marginRight: '8px' }}
      //         />
      //       ) : (
      //         <CustomIcon
      //           name="LUCIDE_ICONS"
      //           icon="LuArrowLeft"
      //           onClick={() => {
      //             formik.resetForm()
      //             setLoading(false)
      //             setIsAvailable(false)
      //             setAssign(false)
      //           }}
      //           color={'grey'}
      //           sx={{ marginRight: '8px' }}
      //         />
      //       )}
      //       <CustomTextInput
      //         formProps={{
      //           sx: {
      //             maxWidth: '340px',
      //             '.MuiOutlinedInput-root': {
      //               paddingRight: '4px'
      //             }
      //           }
      //         }}
      //         input={{
      //           size: 'small',
      //           placeholder: 'Enter Domain Name',
      //           name: 'domain',
      //           value: formik.values.domain,
      //           color: checkAvailable ? 'success' : 'error',
      //           error: (formik.touched.domain && Boolean(formik.errors.domain))?.valueOf(),
      //           helperText: formik.touched.domain && formik.errors.domain,
      //           onChange: async (e) => {
      //             const value = e.target.value.split(' ').join('')
      //             formik.setFieldValue('domain', value)
      //             if (value.length >= 4) {
      //               setLoading(true)
      //               debounce(async () => {
      //                 setIsAvailable(!(await domainExists(value)))
      //                 setLoading(false)
      //               }, 600)()
      //             }
      //           },
      //           slotProps: {
      //             input: {
      //               endAdornment: (
      //                 <div
      //                   style={{
      //                     display: 'flex'
      //                   }}
      //                 >
      //                   {/* <Button
      //                         disableElevation
      //                         disableRipple
      //                         disableFocusRipple
      //                         disableTouchRipple
      //                         variant={'contained'}
      //                         size="small"
      //                       > */}
      //                   {
      //                     <CustomIcon
      //                       name={'LUCIDE_ICONS'}
      //                       icon={'LuArrowRight'}
      //                       color={'white'}
      //                       disabled={!checkAvailable}
      //                       onClick={() => {
      //                         formik.submitForm()
      //                       }}
      //                       sx={{
      //                         backgroundColor: blue['700'],
      //                         width: '32px',
      //                         height: '32px',
      //                         marginLeft: '12px',
      //                         borderRadius: '4px'
      //                       }}
      //                     />
      //                   }
      //                   {/* </Button> */}
      //                 </div>
      //               )
      //             }
      //           }
      //         }}
      //       />
      //     </div>
      //   ) : (
      //     <Button
      //       variant="text"
      //       disableElevation
      //       disableRipple
      //       disableFocusRipple
      //       disableTouchRipple
      //       disabled={checkAvailable}
      //       onClick={() => {
      //         setAssign(true)
      //       }}
      //       startIcon={
      //         <CustomIcon
      //           stopPropagation={false}
      //           name={'IONICONS'}
      //           icon="IoIosLink"
      //           color="primary"
      //         />
      //       }
      //     >
      //       <CustomTypography textTransform={'none'}>Assign Domain</CustomTypography>
      //     </Button>
      //   )
      // }
    />
  )
}

export default AboutHeader
