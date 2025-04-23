import { CircularProgress, Dialog, Fade, styled, Tab, Tabs } from '@mui/material'
import { grey } from '@mui/material/colors'
import MarathonCard from '@renderer/components/card/marathon'
import CustomIcon from '@renderer/components/icons'
import CreateMarathon from '@renderer/components/modal/create-marathon'
import CustomTypography from '@renderer/components/typography'
import { listenToMarathons } from '@renderer/firebase/marathon'
import { useAppSelector } from '@renderer/redux/store/hook'
import { MarathonData } from '@renderer/types/marathon'
import { capitalizeSentence } from '@renderer/utils/functions'
import { errorToast } from '@renderer/utils/toast'
import moment from 'moment'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const tabs = ['ongoing', 'upcoming', 'previous', 'cancelled']

export default function MarathonPage() {
  const { user } = useAppSelector((s) => s.auth)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = React.useState(false)
  const [edit, setEdit] = React.useState<MarathonData | undefined>(undefined)
  const navigation = useNavigate()

  const [tab, setTab] = React.useState<'upcoming' | 'previous' | 'ongoing' | 'cancelled'>(
    'upcoming'
  )
  const [marathons, setMarathons] = React.useState<{
    ongoing: MarathonData[]
    upcoming: MarathonData[]
    previous: MarathonData[]
    cancelled: MarathonData[]
  }>({ upcoming: [], previous: [], ongoing: [], cancelled: [] })

  const tabData = marathons[tab]

  React.useEffect(() => {
    if (!user) return
    setLoading(true)
    const unsubscribe = listenToMarathons(user?.uid as string, (e) => {
      setMarathons({
        ongoing: e.filter(
          (e) =>
            moment().isBetween(moment(e.from_date), moment(e.to_date), null, '[]') &&
            (e.state === 'ONGOING' || e.state === 'UPCOMING')
        ),
        upcoming: e.filter((e) => moment(e.from_date).isAfter(moment())),
        previous: e.filter((e) => e.state === 'FINISHED'),
        cancelled: e.filter((e) => e.state === 'CANCELLED')
      })

      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const keys = Object.keys(marathons) as (keyof typeof marathons)[]

  const handlePress = React.useCallback((data: MarathonData) => {
    if (moment(data.from_date).isAfter(moment())) {
      setEdit(data)
      setOpen(true)
    } else if (
      moment().isBetween(moment(data.from_date), moment(data.to_date), null, '[]') ||
      moment(data.to_date).isBefore(moment())
    ) {
      navigation(`/marathon/${data.mid}`)
    }
  }, [])

  const [viewMore, setViewMore] = React.useState<{
    type: (typeof keys)[number]
    data: MarathonData[]
  } | null>(null)

  return (
    <>
      <Dialog
        onClose={() => setViewMore(null)}
        open={!!viewMore}
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxHeight: 'calc(60vh)',
              overflowY: 'auto',
              padding: '16px 24px',
              paddingTop: '0px',
              display: 'flex',
              flexDirection: 'column',
              '.header': {
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                padding: '16px',
                backgroundColor: '#fff',
                zIndex: 10
              },
              '.container': {
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'flex-start'
              }
            }
          }
        }}
      >
        <div className="header">
          <CustomTypography variant="h4">
            {capitalizeSentence(viewMore?.type || '')} Marathons
          </CustomTypography>
          <CustomIcon
            name="LUCIDE_ICONS"
            icon="LuX"
            onClick={() => setViewMore(null)}
            color={grey['800']}
          />
        </div>
        <div className="container">
          {viewMore?.data?.map((e) => (
            <MarathonCard type="list" data={e} onClick={() => handlePress(e)} />
          ))}
        </div>
      </Dialog>

      <Container
        sx={{
          backgroundColor: '#fff',
          borderRadius: '12px 0px 0px 12px',
          height: 'calc(100%)',
          maxHeight: 'calc(100%)',
          overflow: 'auto',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: '12px'
        }}
      >
        <ColumnContainer sx={{ gap: '24px' }}>
          <CustomTypography variant="h4">Marathons</CustomTypography>
          <MarathonCard type="add" onClick={() => setOpen(true)} />
        </ColumnContainer>
        <CreateMarathon
          onClose={() => {
            setOpen(false)
            setEdit(undefined)
          }}
          open={open}
          edit={edit}
        />
        {loading && <CircularProgress variant="indeterminate" />}
        <ColumnContainer
          sx={{
            paddingTop: '0px'
          }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            {tabs.map((t) => (
              <Tab value={t} label={capitalizeSentence(t)} />
            ))}
          </Tabs>
        </ColumnContainer>
        <Fade in={!loading}>
          <ColumnContainer sx={{ gap: '24px', paddingTop: '0px' }}>
            <div className="row">
              {tabData.length >= 1 ? (
                <>
                  {tabData.map((e) => (
                    <MarathonCard
                      type="list"
                      data={e}
                      onClick={() => {
                        if (e.state === 'CANCELLED') {
                          errorToast(
                            'Cancelled marathon are not viewable. Contact admin for more info.'
                          )
                          return
                        }
                        handlePress(e)
                      }}
                    />
                  ))}
                </>
              ) : (
                <div>
                  <CustomTypography variant="body2">
                    You don't have any {capitalizeSentence(tab)} Marathons
                  </CustomTypography>
                </div>
              )}
            </div>
          </ColumnContainer>
        </Fade>
      </Container>
    </>
  )
}

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})

const ColumnContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',

  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: '24px',
  '.row': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    flexWrap: 'wrap'
  }
})
