import { styled } from '@mui/material'
import CustomIcon from '../icons'
import CustomTypography from '../typography'
import { MarathonData } from '@renderer/types/marathon'
import { capitalizeSentence } from '@renderer/utils/functions'
import moment from 'moment'
import React from 'react'

type Props =
  | {
      type: 'add' | 'list'
      data?: MarathonData
      onClick(): void
      children?: undefined
    }
  | {
      type: 'more'
      children?: React.ReactNode
      data?: MarathonData
      onClick(): void
    }

export default function MarathonCard({ type, data, onClick, ...props }: Props) {
  const isAdd = type === 'add' || !data
  return (
    <Container
      onClick={onClick}
      sx={
        isAdd
          ? {
              cursor: 'pointer',
              backgroundColor: type === 'more' ? '#e9e9e9' : 'rgba(170, 176, 234, 0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transform: 'scale(1)',
              minWidth: '320px',
              maxWidth: '320px'
            }
          : {
              minWidth: '345px',
              maxWidth: '345px',
              cursor: 'pointer',
              backgroundColor:
                type === 'more'
                  ? '#efefef'
                  : data?.state === 'ONGOING'
                    ? '#34daffad'
                    : data?.state === 'FINISHED'
                      ? '#a4ff34ac'
                      : '#f96df9ac'
            }
      }
    >
      {type === 'more' ? (
        props.children
      ) : (
        <>
          {isAdd ? (
            <>
              <CustomIcon
                stopPropagation={false}
                name="LUCIDE_ICONS"
                icon="LuPlus"
                color={'#110067'}
                size={24}
              />
              <CustomTypography variant="body1">Create Marathon</CustomTypography>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    padding: '12px 0px 16px 0px'
                  }}
                >
                  <CustomTypography variant="h4" color="#ffffffd3">
                    {capitalizeSentence(data?.type)} Marathon
                  </CustomTypography>
                </div>
                <div style={{ flexDirection: 'column' }}>
                  <CustomTypography>
                    From:&nbsp;<b>{moment(data?.from_date).format('DD-MM-YYYY')}</b>
                  </CustomTypography>
                  <CustomTypography>
                    To:&nbsp;<b>{moment(data?.to_date).format('DD-MM-YYYY')}</b>
                  </CustomTypography>
                </div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'row-reverse' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CustomTypography variant="body2">Total Competitors</CustomTypography>
                  <CustomTypography variant="h1">{data?.total_users}</CustomTypography>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',

  minHeight: '220px',
  borderRadius: '16px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'scale(0.99)'
  },
  transition: 'all .3s'
})
