import { Paper, Button, styled, Tooltip } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import React, { useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import moment from 'moment'
import UpdateRecord from './update-record'
import { useParams } from 'react-router-dom'
import { RecordType } from '@renderer/types/record'
import { asyncSetCurrentUser } from '@renderer/redux/features/user/customers'
import { embedAllStyles } from '@renderer/utils/functions'
import RecordChart from '@renderer/components/chart'

export enum color {
  NORMAL = '#28A745', // Green - Normal
  RISKY = '#FFC107', // Yellow - Risky
  VERY_RISKY = '#FD7E14', // Orange - Very Risky
  EXTREMELY_RISKY = '#DC3545' // Red - Extremely Risky
}

const headers = [
  ['', 'Date', 'Weight'],
  ['Body Fat', 'Men', 'Women'],
  'Visceral Fat \n%',
  'BMR (RM)',
  'BMI',
  'Body Age',
  'TSF',
  ['', 'MEN', 'WOMEN']
]

const RenderRow = ({ data, gender }: { data: RecordType } & { gender: string }) => {
  const maleFat = gender === 'male' ? data.body_fat : '-'
  const femaleFat = gender === 'female' ? data.body_fat : '-'

  const skeletonMale = gender === 'male' ? data.skeletal_muscle : '-'
  const skeletonFemale = gender === 'female' ? data.skeletal_muscle : '-'

  const values = [
    ['', moment(data.recorded_on).format('DD/MM/YYYY'), data.weight],
    ['', maleFat, femaleFat],
    data.visceral_fat,
    data.bmr,
    data.bmi,
    data.body_age,
    data.tsf,
    ['', skeletonMale, skeletonFemale]
  ]

  return values.map((e, idx) => {
    const isLast = idx === headers.length - 1
    if (typeof e === 'string') {
      return (
        <CustomTypography
          sx={{
            width: '100%',
            height: '100%',
            '& *': {
              margin: 'auto'
            }
          }}
          borderBottom={'2px solid'}
          borderRight={'2px solid'}
          textAlign={'center'}
          whiteSpace={'break-spaces'}
        >
          <span>{e}</span>
        </CustomTypography>
      )
    } else {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
          }}
        >
          {e[0].length >= 1 && (
            <CustomTypography
              width={'100%'}
              textAlign={'center'}
              borderRight={'2px solid'}
              borderBottom={'2px solid'}
            >
              <span>{e[0]}</span>
            </CustomTypography>
          )}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row'
            }}
          >
            <CustomTypography
              width={'100%'}
              textAlign={'center'}
              borderRight={'2px solid'}
              borderBottom={'2px solid'}
              borderLeft={isLast ? undefined : '2px solid'}
            >
              <span>{e[1]}</span>
            </CustomTypography>
            <CustomTypography
              width={'100%'}
              textAlign={'center'}
              borderRight={'2px solid'}
              borderBottom={'2px solid'}
            >
              <span>{e[2]}</span>
            </CustomTypography>
          </div>
        </div>
      )
    }
  })
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
  const [scale, setScale] = useState(1)

  const [key, setKey] = React.useState(0)

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
      setScale(scaleFactor)
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

          {/* <Menu open={!!menu} anchorEl={menu} onClose={() => setShowMenu(null)}>
            <MenuItem>Weekly</MenuItem>
            <MenuItem>Record</MenuItem>
          </Menu> */}
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
                    console.log(printDocument)
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
            <Tooltip title={'Refresh'} placement="left">
              <span>
                <CustomIcon
                  name="MATERIAL_DESIGN"
                  icon="MdRefresh"
                  onClick={() => {
                    setKey(Math.random)
                  }}
                />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="download_customer_record" key={key}>
          <Paper
            elevation={0}
            className="set_print_transform_origin"
            ref={paperRef}
            sx={{
              minWidth: '100%', // Ensures it stretches properly
              width: '100%',
              height: '100%',
              minHeight: '200px',
              marginTop: '12px',
              overflow: 'hidden', // Prevents scrolling
              transform: `scale(${scale})`
              // transformOrigin: 'top left' // Ensures scaling is anchored properly
            }}
            // className="download_customer_record"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <CustomTypography>
                  Name : &nbsp;<b>{current_customer?.data?.name}</b>
                </CustomTypography>
                <CustomTypography>
                  Phone : &nbsp;<b>{current_customer?.data?.phone}</b>
                </CustomTypography>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '320px' }}>
                <CustomTypography
                  sx={{
                    width: '100%',
                    display: 'inline-block',
                    textWrap: 'pretty',
                    textAlign: 'start'
                  }}
                >
                  Center Address : &nbsp;
                  <b>{user?.center_address}</b>
                </CustomTypography>
                <CustomTypography
                  sx={{
                    width: '100%',
                    display: 'inline-block',
                    textWrap: 'pretty',
                    textAlign: 'start'
                  }}
                >
                  Center Phone : &nbsp;<b>+91-{user?.phone}</b>
                </CustomTypography>
              </div>
            </div>
            <br />
            <TableHeader
              sx={{
                gridTemplateRows: 'repeat(4, 30px)',
                borderBottom: '2px solid'
              }}
            >
              {/* label */}
              <Wrapper className={'n'} col={'1'} row={1}>
                <CustomTypography>Normal</CustomTypography>
              </Wrapper>
              <Wrapper className={'r'} col={'1'} row={2}>
                <CustomTypography>Risky</CustomTypography>
              </Wrapper>
              <Wrapper className={'vr'} col={'1'} row={3}>
                <CustomTypography>Very Risky</CustomTypography>
              </Wrapper>
              <Wrapper className={'er'} col={'1'} row={4}>
                <CustomTypography>Extremely Risky</CustomTypography>
              </Wrapper>
              {/* label end */}

              {/* Men Women Value */}
              <Wrapper col={2} row={1} className="triple">
                <div>10-20</div>
                <div className="dicider">&nbsp;</div>
                <div>20-30</div>
              </Wrapper>
              <Wrapper col={2} row={2} className="triple">
                <div>20-25</div>
                <div className="dicider">&nbsp;</div>

                <div>30-35</div>
              </Wrapper>
              <Wrapper col={2} row={3} className="triple">
                <div>25-30</div>
                <div className="dicider">&nbsp;</div>

                <div>35-40</div>
              </Wrapper>
              <Wrapper col={2} row={4} className="triple">
                <div> {'>30'}</div>
                <div className="dicider">&nbsp;</div>

                <div>{'>40'}</div>
              </Wrapper>
              {/* Men Women Value end */}

              {/* Viseral Fat Value */}
              <Wrapper col={3} row={1}>
                <div>1-9</div>
              </Wrapper>
              <Wrapper col={3} row={2}>
                <div>10-13</div>
              </Wrapper>
              <Wrapper col={3} row={3}>
                <div>14-15</div>
              </Wrapper>
              <Wrapper col={3} row={4}>
                <div>{'>16'}</div>
              </Wrapper>
              {/* Viseral Fat Value end */}

              {/* BMR */}
              <Wrapper className={'n'} col={4} row={1}>
                <div>0</div>
              </Wrapper>
              <Wrapper className={'r'} col={4} row={2}>
                <div>+</div>
              </Wrapper>
              <Wrapper className={'vr'} col={4} row={3}>
                <div>++</div>
              </Wrapper>
              <Wrapper className={'er'} col={4} row={4}>
                <div>+++</div>
              </Wrapper>
              {/* BMR end */}

              {/* BMI */}
              <Wrapper col={5} row={1}>
                <div>18.5-23</div>
              </Wrapper>
              <Wrapper col={5} row={2}>
                <div>23-25</div>
              </Wrapper>
              <Wrapper col={5} row={3}>
                <div>25-30</div>
              </Wrapper>
              <Wrapper col={5} row={4}>
                <div>{'>30'}</div>
              </Wrapper>
              {/* BMI end */}
              {/* BODY AGE */}
              <Wrapper className="n" col={6} row={1}>
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuArrowRight"
                  size={24}
                  color={color.NORMAL}
                />
              </Wrapper>
              <Wrapper className="r" col={6} row={2}>
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuArrowRight"
                  size={24}
                  color={color.RISKY}
                />
              </Wrapper>
              <Wrapper className="vr" col={6} row={3}>
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuArrowRight"
                  size={24}
                  color={color.VERY_RISKY}
                />
              </Wrapper>
              <Wrapper className="er" col={6} row={4}>
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuArrowRight"
                  size={24}
                  color={color.EXTREMELY_RISKY}
                />
              </Wrapper>
              {/* BODY AGE end */}
              {/* TSF AGE */}
              <Wrapper col={7} row={1}>
                <div>{'<15%'}</div>
              </Wrapper>
              <Wrapper col={7} row={2}>
                <div>MEN</div>
              </Wrapper>
              <Wrapper col={7} row={3}>
                <div>{'<30%'}</div>
              </Wrapper>
              <Wrapper col={7} row={4}>
                WOMEN
              </Wrapper>
              {/* TSF AGE end */}
              {/* skeletal muscle AGE */}
              <Wrapper className="four n" col={8} row={1}>
                <div>Good</div>
                <div>35.8 - 37.3</div>
                <div>+</div>
                <div>28.0-29.9</div>
              </Wrapper>
              <Wrapper className="four rr" col={8} row={2}>
                <div>Normal</div>
                <div>35.8 - 37.3</div>
                <div>+</div>
                <div>28.0-29.9</div>
              </Wrapper>
              <Wrapper className="four r" col={8} row={3}>
                <div>Risk</div>
                <div>35.8 - 37.3</div>
                <div>+</div>
                <div>28.0-29.9</div>
              </Wrapper>
              <Wrapper col={8} row={4}>
                <CustomTypography textTransform={'uppercase'}>SKELETAL MUSCLE</CustomTypography>
              </Wrapper>
              {/* skeletal muscle AGE end */}
            </TableHeader>
            <TableHeader
              sx={{
                gridTemplateRows: 'repeat(1, auto)'
              }}
            >
              {headers.map((e, idx) => {
                const isLast = idx === headers.length - 1
                if (typeof e === 'string') {
                  return (
                    <CustomTypography
                      borderBottom={'2px solid'}
                      borderRight={'2px solid'}
                      textAlign={'center'}
                      whiteSpace={'break-spaces'}
                    >
                      {e}
                    </CustomTypography>
                  )
                } else {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {e[0].length >= 1 && (
                        <CustomTypography
                          width={'100%'}
                          textAlign={'center'}
                          borderRight={'2px solid'}
                          borderBottom={'2px solid'}
                        >
                          {e[0]}
                        </CustomTypography>
                      )}
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexDirection: 'row'
                        }}
                      >
                        <CustomTypography
                          width={'100%'}
                          textAlign={'center'}
                          borderRight={'2px solid'}
                          borderBottom={'2px solid'}
                          borderLeft={isLast ? undefined : '2px solid'}
                        >
                          {e[1]}
                        </CustomTypography>
                        <CustomTypography
                          width={'100%'}
                          textAlign={'center'}
                          borderRight={'2px solid'}
                          borderBottom={'2px solid'}
                        >
                          {e[2]}
                        </CustomTypography>
                      </div>
                    </div>
                  )
                }
              })}
            </TableHeader>
            {current_customer?.records?.data?.map((vt) => (
              <TableHeader
                sx={{
                  gridTemplateRows: 'repeat(1, auto)'
                }}
              >
                <RenderRow data={vt} gender={current_customer?.data.gender as string} />
              </TableHeader>
            ))}
            <RecordChart data={current_customer?.records.data || []} type="customer" />
          </Paper>
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

const TableHeader = styled('div')({
  width: '100%',
  display: 'grid',
  padding: '0px',
  gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr 3fr',
  minWidth: '1290px',
  maxWidth: '100%'
})

const Wrapper = styled('div')<{ col: string | number; row: string | number; bg?: string }>(
  ({ col, row, bg }) => ({
    width: '100%',
    height: '100%',
    gridColumn: col,
    gridRow: row,
    border: '1px solid',
    backgroundColor: bg,
    gap: '0px',
    '& *': {
      padding: '2px',
      margin: 'auto'
    },
    '&.n': {
      backgroundColor: color.NORMAL,
      '& *': {
        color: 'white'
      }
    },
    '&.r': {
      backgroundColor: color.RISKY,
      '& *': {
        color: 'black'
      }
    },
    '&.vr': {
      backgroundColor: color.VERY_RISKY,
      '& *': {
        color: 'white'
      }
    },
    '&.er': {
      backgroundColor: color.EXTREMELY_RISKY,
      '& *': {
        color: 'white'
      }
    },
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    '&.triple': {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      '& div, & p': {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&.dicider': {
          width: '2px',
          height: '100%',
          backgroundColor: 'black'
        }
      }
    },
    '&.four': {
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr auto auto',
      paddingRight: '12px',
      'div:nth-child(1)': {
        width: '100%',
        borderRight: '2px solid',
        paddingRight: '12px'
      }
    }
  })
)
