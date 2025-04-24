import { Button, styled, Tooltip } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import React, { useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import UpdateRecord from './update-record'
import { useParams } from 'react-router-dom'
import { RecordType } from '@renderer/types/record'
import { asyncSetCurrentUser } from '@renderer/redux/features/user/customers'
import { embedAllStyles } from '@renderer/utils/functions'
import Records from './record-chart'

export enum color {
  NORMAL = '#28A745', // Green - Normal
  RISKY = '#FFC107', // Yellow - Risky
  VERY_RISKY = '#FD7E14', // Orange - Very Risky
  EXTREMELY_RISKY = '#DC3545' // Red - Extremely Risky
}

const CustomerRecords = () => {
  const [showModal, setShowModal] = React.useState(false)
  const [edit, setEdit] = React.useState<RecordType | null>(null)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const param = useParams() as { visitorId: string }
  const { current_customer } = useAppSelector((s) => s.customer)

  const contentRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (user) {
      if (!current_customer && param?.visitorId) {
        dispatch(asyncSetCurrentUser({ uid: user?.uid, cid: param.visitorId }))
        return
      } else if (current_customer?.data.cid !== param.visitorId) {
        dispatch(asyncSetCurrentUser({ uid: user?.uid, cid: param.visitorId }))
      }
    }
    const adjustScale = () => {
      if (!contentRef.current || !paperRef.current) return

      const paperRect = paperRef.current.getBoundingClientRect()
      const parentRect = contentRef.current?.getBoundingClientRect()

      if (!parentRect || !paperRect) return

      let scaleFactor = parentRect.width / paperRect.width
      scaleFactor = Math.min(scaleFactor, 1) // Ensures it does not go above 1
    }
    adjustScale()
    window.addEventListener('resize', adjustScale)
    return () => window.removeEventListener('resize', adjustScale)
  }, [])

  return (
    <>
      <UpdateRecord
        edit={edit ?? null}
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEdit(null)
        }}
      />
      <Container
        className="layout"
        style={{
          overflow: 'hidden', // Prevents unwanted scrolling
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        ref={contentRef}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Button size="medium" onClick={() => setShowModal(true)} variant={'contained'}>
            Add Record
          </Button>
          <div style={{ gap: 12, display: 'flex', alignItems: 'center' }}>
            <Tooltip title={'Download now'} placement="left">
              <span>
                <CustomIcon
                  name="LUCIDE_ICONS"
                  icon="LuDownload"
                  onClick={() => {
                    // setShowMenu(e.currentTarget)

                    const printDocument = embedAllStyles(
                      '.download_customer_record',
                      `${current_customer?.data?.name}-Record`
                    )
                    if (printDocument) {
                      window.electron?.ipcRenderer.send(
                        'generatePdf',
                        printDocument,
                        `${current_customer?.data?.name}-${current_customer?.data?.phone}`.replace(
                          '.',
                          '_'
                        )
                      )
                    }
                  }}
                />
              </span>
            </Tooltip>
          </div>
        </div>
        <div style={{ overflowX: 'scroll', width: '100%' }} className="hide-scrollbar">
          <Records
            daysLeft={current_customer?.subscription?.daysLeft}
            name={current_customer?.data?.name}
            gender={current_customer?.data?.gender as string}
            records={current_customer?.records?.data ?? []}
            center_address={user?.center_address}
            phone={current_customer?.data?.phone}
          />
        </div>
      </Container>
    </>
  )
}

export default CustomerRecords

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
})
