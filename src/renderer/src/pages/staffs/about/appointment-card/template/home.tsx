import { Button, Dialog, Divider, styled, Tooltip } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { bgImages, setCardDetails } from '@renderer/redux/features/user/card'
import CustomTextInput from '@renderer/components/text-input'
import { errorToast } from '@renderer/utils/toast'

const HomeTemplate = () => {
  const dispatch = useAppDispatch()
  const data = useAppSelector((s) => s.card.editor.data?.['personal_details'])
  const [showBG, setShowBG] = React.useState(false)

  return (
    <Container className="template_personal_details">
      <Dialog
        open={showBG}
        onClose={() => setShowBG(false)}
        sx={{
          '.MuiPaper-root': {
            width: '100%',
            maxWidth: '540px',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 24px'
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px 0px 12px 0px'
          }}
        >
          <CustomTypography variant="body1" fontWeight={'medium'}>
            Select Background
          </CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} icon="LuX" onClick={() => setShowBG(false)} />
        </div>
        <Divider sx={{ marginBottom: '12px' }} />
        <BGContainers>
          {bgImages?.map((e) => (
            <div
              className={['colors', data?.card_theme?.hero_bg_image === e?.bg ? 'show' : ''].join(
                ' '
              )}
              onClick={() => {
                dispatch(
                  setCardDetails({
                    id: 'personal_details',
                    value: {
                      ...data,
                      card_theme: {
                        ...data?.card_theme,
                        accent_color: e.color,
                        hero_bg_image: e.bg,
                        background_color: e.backgroundColor
                      }
                    }
                  })
                )
                setShowBG(false)
              }}
            >
              <img src={e.bg} alt="" />
            </div>
          ))}
        </BGContainers>
      </Dialog>
      <CustomTypography
        paddingBottom={'12px'}
        variant={'h4'}
        width={'100%'}
        marginBottom={'12px'}
        borderBottom={`1px solid ${grey['300']}`}
        sx={{
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: '12px'
        }}
      >
        Personal Details
      </CustomTypography>
      {data?.card_theme ? (
        <>
          <CustomTypography>Selected Theme</CustomTypography>
          <div
            style={{
              width: '80px',
              height: '80px',
              overflow: 'hidden',
              position: 'relative',
              top: 0
            }}
          >
            <div
              style={{
                all: 'inherit',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 100,
                backgroundColor: red['600'] + '1a',
                borderRadius: '12px'
              }}
            >
              <Tooltip title={'Change Theme'} arrow={true}>
                <span>
                  <CustomIcon
                    name={'FONT_AWESOME'}
                    icon={'FaExchangeAlt'}
                    color={'white'}
                    onClick={() => setShowBG(true)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      zIndex: 100,
                      backgroundColor: red['600'] + 'aa',
                      borderRadius: '12px',
                      opacity: 0,
                      '&:hover': {
                        opacity: 1,
                        pointerEvents: 'all'
                      }
                    }}
                  />
                </span>
              </Tooltip>
            </div>
            <img
              src={data?.card_theme?.hero_bg_image}
              alt={'img'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          </div>
        </>
      ) : (
        <FabButton
          variant="outlined"
          onClick={() => {
            setShowBG(true)
            // dispatch(
            //   validateCardDetails({
            //     id: 'contact'
            //   })
            // </Container>
          }}
          startIcon={<CustomIcon name={'LUCIDE_ICONS'} icon={'LuPlus'} />}
        >
          <CustomTypography variant={'body2'} textTransform={'none'}>
            Select Background Banner
          </CustomTypography>
        </FabButton>
      )}
      <CustomTextInput
        formProps={{
          sx: {
            padding: '12px 0px'
          }
        }}
        input={{
          label: 'Center Name',
          size: 'small',
          type: 'text',
          value: data?.center_name,
          onChange: (e) => {
            dispatch(
              setCardDetails({
                id: 'personal_details',
                value: {
                  ...data,
                  center_name: e.target.value
                }
              })
            )
          }
        }}
      />
      <Divider />
      <CustomTypography
        variant={'h6'}
        sx={{
          paddingTop: '12px'
        }}
      >
        Coach Names
      </CustomTypography>
      {data?.displayName?.map((d, k) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <CustomTextInput
            input={{
              value: d.value,
              label: 'Name of the couch',
              size: 'small',
              type: 'text',
              onChange: (e) => {
                dispatch(
                  setCardDetails({
                    id: 'personal_details',
                    value: {
                      ...data,
                      displayName: data.displayName?.map((dn, idx) => {
                        if (idx === k) {
                          return {
                            ...dn,
                            value: e.target.value
                          }
                        }
                        return dn
                      })
                    }
                  })
                )
              },
              slotProps: {
                input: {
                  endAdornment: (
                    <CustomIcon
                      name={'LUCIDE_ICONS'}
                      icon={'LuX'}
                      color={'primary'}
                      onClick={() => {
                        dispatch(
                          setCardDetails({
                            id: 'personal_details',
                            value: {
                              ...data,
                              displayName: data.displayName
                                ?.filter((_, idx) => (idx === k ? null : _))
                                .filter((e) => e !== null)
                            }
                          })
                        )
                      }}
                    />
                  )
                }
              }
            }}
          />
          <CustomTextInput
            input={{
              onChange: (e) => {
                dispatch(
                  setCardDetails({
                    id: 'personal_details',
                    value: {
                      ...data,
                      displayName: data.displayName?.map((dn, idx) => {
                        if (idx === k) {
                          return {
                            ...dn,
                            designation: e.target.value
                          }
                        }
                        return dn
                      })
                    }
                  })
                )
              },
              value: d.designation,
              label:
                d.value.length !== 0 ? `Designation of ${d.value}` : `Designation of the coach`,
              size: 'small',
              type: 'text'
            }}
          />
          <Divider
            sx={{
              margin: '12px'
            }}
          />
        </div>
      ))}
      <Button
        variant={'outlined'}
        sx={{
          margin: '12px 0px'
        }}
        onClick={() => {
          if (data?.displayName && data?.displayName?.length !== 0) {
            if (
              data?.displayName?.filter((e) => e.designation.length === 0 || e.value.length === 0)
                ?.length !== 0
            ) {
              errorToast('Enter / Clear the previous Fields to create new')
              return
            }
          }
          dispatch(
            setCardDetails({
              id: 'personal_details',
              value: {
                ...data,
                displayName: [
                  ...(data?.displayName ?? []),
                  {
                    value: '',
                    designation: ''
                  }
                ]
              }
            })
          )
        }}
      >
        {data?.displayName?.length !== 0 ? 'Add Coach Details' : 'Add Coach Details'}
      </Button>
    </Container>
  )
}

export default HomeTemplate

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 24px',
  position: 'relative',
  top: 0
})

const FabButton = styled(Button)(({ theme }) => ({
  width: 'max-content',
  height: 'max-content',
  padding: '8px 12px',
  borderRadius: '12px',
  cursor: 'pointer',
  zIndex: 100,
  ...theme.components?.MuiButton?.defaultProps?.style
}))

const BGContainers = styled('div')({
  width: '100%',
  overflowX: 'auto',
  display: 'flex',
  flexWrap: 'nowrap',
  padding: '12px 12px',
  paddingBottom: '12px',
  gap: '24px',
  '& .colors': {
    width: '100px',
    height: '100px',
    padding: '8px',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: `0px 0px 0px 4px #63636386`,
    overflow: 'hidden',
    '&.show': {
      boxShadow: `0px 0px 0px 4px #81ff9c`,
      '&:hover': {
        boxShadow: `0px 0px 0px 4px #6cff8c`
      }
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '8px'
    }
  }
})
