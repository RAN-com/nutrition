import { CircularProgress, Fade, styled } from '@mui/material'
import { listenToSingleMarathon } from '@renderer/firebase/marathon'
import { useAppSelector } from '@renderer/redux/store/hook'
import { MarathonData } from '@renderer/types/marathon'
import React from 'react'
import { useParams } from 'react-router-dom'
import MarathonContent from './content'
import MarathonUserDetail from './user'

export default function MarathonDetails() {
  const admin = useAppSelector((s) => s.auth.user)
  const { marathonId } = useParams()
  const [data, setData] = React.useState<MarathonData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [cid, setCid] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(true)
    const sub = listenToSingleMarathon(admin?.uid as string, marathonId as string, (m) => {
      setData(m)
      setLoading(false)
    })
    return () => sub()
  }, [marathonId])

  return (
    <Fade in={!!data && !loading}>
      <Container
        sx={{
          height: 'calc(100%)',
          maxHeight: 'calc(100%)',
          overflow: 'auto',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'flex',
          flexGrow: 1,
          gap: '12px'
        }}
      >
        {loading ? (
          <>
            <CircularProgress variant="indeterminate" />
          </>
        ) : (
          !!data && (
            <>
              <MarathonContent data={data} handleClick={(e) => setCid(e)} />
              <MarathonUserDetail data={data} cid={cid} />
            </>
          )
        )}
      </Container>
    </Fade>
  )
}

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
