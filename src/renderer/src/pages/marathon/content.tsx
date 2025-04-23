import {
  Button,
  Menu,
  MenuItem,
  Modal,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import { grey, red } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import {
  MarathonCancelModal,
  MarathonDeleteModal
} from '@renderer/components/modal/marathon-action'
import UpdateMarathon from '@renderer/components/modal/update-marathon'
import CustomTypography from '@renderer/components/typography'
import { MarathonData } from '@renderer/types/marathon'
import { capitalizeSentence } from '@renderer/utils/functions'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeaderBoard from './leaderboard'
import { markMarathonFinished } from '@renderer/firebase/marathon'

type Props = {
  data: MarathonData
  handleClick(e: string): void
}

const HEADER = [
  'Position',
  'Name',
  'Total Weight',
  'Initial Weight/Height',
  'Current Weight/Height',
  ''
]

const getCustomer = (marathon: MarathonData, cid: string) => {
  const graph = marathon?.graph[cid] // Access graph directly by cid
  if (!graph)
    return {
      customer: marathon.customers.filter((e) => e.cid === cid)[0],
      latest: `-/-`,
      initial: `-/-`,
      graph: []
    }
  const initialWeight = graph.values.filter((e) => e.day === 0)[0]?.weight ?? '-' //handle undefined
  const initialHeight = graph.values.filter((e) => e.day === 0)[0]?.height ?? '-' //handle undefined

  const values = graph.values.sort((a, b) => a.day - b.day)

  const latestWeight = values[values.length - 1]?.weight ?? '-' //handle undefined
  const latestHeight = values[values.length - 1]?.height ?? '-' //handle undefined

  return {
    customer: marathon.customers.filter((e) => e.cid === cid)[0],
    latest: `${latestWeight}/${latestHeight}`,
    initial: `${initialWeight}/${initialHeight}`,
    graph: marathon.graph[cid] // Access graph directly by cid
  }
}
// Memoized table data generation
const generateTableData = (marathon: MarathonData) => {
  if (marathon.positions.length > 0) {
    return marathon.positions
      .sort((a, b) => a.position - b.position)
      .map((entry) => [
        entry.position,
        getCustomer(marathon, entry.cid)?.customer.name ?? '',
        `${entry.weightLossOrWeightGain ?? 0} kg`,
        `${getCustomer(marathon, entry.cid)?.initial}`,
        `${getCustomer(marathon, entry.cid)?.latest}`,
        entry.cid
      ])
  } else {
    return marathon.customers.map((c) => ['', c.name, '-', '-', '-', c.cid])
  }
}

const Marathon = ({ data, handleClick }: Props) => {
  const navigate = useNavigate()

  // Memoize the table data generation
  const genData = useMemo(() => generateTableData(data), [data]) // Recalculates when `data` changes

  const isPrevious = moment(data?.to_date)?.isBefore(moment())
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [idx, setIdx] = useState<number | null>(null)

  const isFinished = moment().isSameOrAfter(data?.to_date)

  const [showMore, setShowMore] = React.useState<Element | null>(null)
  const [showDeleteModal, setShowDelModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const isActive = data?.state === 'CANCELLED' || data?.state === 'FINISHED'
  const [loading, setLoading] = useState(false)

  return (
    <Container
      sx={{
        padding: '16px',
        paddingTop: '0px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        height: 'max-content',
        gap: '16px',
        '.header': {
          width: '100%',
          height: 'max-content',
          padding: '12px',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '12px'
        }
      }}
    >
      <div className="header">
        <CustomIcon
          name="LUCIDE_ICONS"
          icon="LuArrowLeft"
          onClick={() => {
            navigate('/marathon', { replace: true })
          }}
        />
        <CustomTypography color={'grey'}>Back to marathons</CustomTypography>
      </div>
      {isActive ? (
        <LeaderBoard data={data} onClick={handleClick} />
      ) : (
        <>
          <Modal open={loading}>
            <></>
          </Modal>
          <Row>
            <div>
              <CustomTypography variant="h4">
                {capitalizeSentence(data?.type)} Marathon
              </CustomTypography>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingBottom: '24px',
                  paddingTop: '12px'
                }}
              >
                <CustomTypography variant="body1">
                  {capitalizeSentence('From')}:&nbsp;
                  <b>{moment(data?.from_date).format('DD/MM/YYYY')}</b>
                </CustomTypography>
                <CustomTypography variant="body1">
                  {capitalizeSentence('To')}:&nbsp;
                  <b>{moment(data?.to_date).format('DD/MM/YYYY')}</b>
                </CustomTypography>
              </div>
            </div>
            {!isActive && (
              <Row sx={{ width: 'auto', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="contained"
                  disabled={!isFinished}
                  onClick={async () => {
                    setLoading(true)
                    await markMarathonFinished(data?.created_by?.uid as string, data?.mid as string)
                    setLoading(false)
                  }}
                >
                  Mark as Finished
                </Button>
                <CustomIcon
                  onClick={(e) => setShowMore(e.currentTarget)}
                  icon="MdMoreVert"
                  name="MATERIAL_DESIGN"
                  sx={{
                    padding: '8px 8px',
                    '&:hover': {
                      backgroundColor: '#00000011',
                      borderRadius: 100
                    }
                  }}
                />
              </Row>
            )}
          </Row>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {HEADER.map((h) => (
                    <TableCell
                      align="justify"
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'start',
                        lineHeight: 1,
                        minWidth: h.includes('Name') ? '240px' : 'auto'
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {genData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': {
                        cursor: 'pointer',
                        transition: 'all .3s',
                        backgroundColor: '#dedede8b'
                      }
                    }}
                  >
                    {row.map((r, i) => (
                      <TableCell
                        align="justify"
                        key={i}
                        onClick={() => {
                          handleClick(row[row.length - 1] as string)
                        }}
                      >
                        {i === row.length - 1 ? (
                          !isActive ? (
                            isPrevious ? (
                              <CustomIcon
                                name="LUCIDE_ICONS"
                                icon="LuArrowRight"
                                stopPropagation={false}
                              />
                            ) : (
                              <CustomIcon
                                icon="MdMoreVert"
                                name="MATERIAL_DESIGN"
                                onClick={(e) => {
                                  setAnchorEl(e.currentTarget)
                                  setIdx(index)
                                }}
                              />
                            )
                          ) : (
                            <></>
                          )
                        ) : (
                          r
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {anchorEl && (
            <Menu open={!!anchorEl} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
              <>
                <MenuItem
                  onClick={() => {
                    setOpenModal(true)
                    setAnchorEl(null)
                  }}
                >
                  Add Records
                </MenuItem>
              </>
            </Menu>
          )}
          {showMore && (
            <Menu
              open={!!showMore}
              onClose={() => setShowMore(null)}
              anchorEl={showMore}
              sx={{
                '& .MuiMenuItem-root': {
                  gap: '8px'
                },
                '& .delete': {
                  '& *': {
                    color: red['400']
                  }
                }
              }}
            >
              <>
                <MenuItem
                  onClick={() => {
                    setShowCancelModal(true)
                    setShowDelModal(false)
                    setShowMore(null)
                  }}
                >
                  <CustomIcon name="LUCIDE_ICONS" icon="LuX" size={18} color={grey['800']} />{' '}
                  <CustomTypography>Cancel</CustomTypography>
                </MenuItem>
                <MenuItem
                  className={'delete'}
                  onClick={() => {
                    setShowDelModal(true)
                    setShowCancelModal(false)
                    setShowMore(null)
                  }}
                >
                  <CustomIcon name="LUCIDE_ICONS" icon="LuTrash" size={18} />{' '}
                  <CustomTypography>Delete</CustomTypography>
                </MenuItem>
              </>
            </Menu>
          )}
          <UpdateMarathon
            open={openModal}
            onClose={() => setOpenModal(false)}
            data={data}
            cid={genData[idx || 0][genData[idx || 0].length - 1] as string}
          />
          <MarathonCancelModal
            uid={data?.created_by?.uid as string}
            mid={data?.mid as string}
            open={showCancelModal}
            onClose={() => setShowCancelModal(false)}
          />
          <MarathonDeleteModal
            uid={data?.created_by?.uid as string}
            mid={data?.mid as string}
            open={showDeleteModal}
            onClose={() => setShowDelModal(false)}
          />
        </>
      )}
    </Container>
  )
}

const MarathonContent = React.memo((props: Props) => <Marathon {...props} />)
export default MarathonContent

const Container = styled('div')({
  width: '100%'
})

const TableContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'auto'
})

const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between'
})
