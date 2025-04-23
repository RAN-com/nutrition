import {
  Avatar,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { MarathonData } from '@renderer/types/marathon'
import { capitalizeSentence } from '@renderer/utils/functions'
import { useMemo } from 'react'

type Props = {
  onClick(e: string): void
  data: MarathonData
}

const colors = ['#FDB896', '#68DAF9', '#98F968']

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

export default function LeaderBoard({ data, onClick }: Props) {
  console.log(data)
  const top_tail = data?.positions.filter((_, i) => i <= 2)
  const placement = [
    top_tail.filter((e) => e.position === 3)[0],
    top_tail.filter((e) => e.position === 1)[0],
    top_tail.filter((e) => e.position === 2)[0]
  ]

  const genData = useMemo(() => generateTableData(data), [data]).filter((_, i) => i > 2)

  const HEADER = [
    'Position',
    'Name',
    'Total Weight',
    'Initial Weight/Height',
    'Current Weight/Height',
    ''
  ]

  return (
    <>
      <Row>
        {placement?.map(
          (e) =>
            e && (
              <Card
                onClick={() => onClick(e.cid)}
                sx={{
                  backgroundColor: colors[e.position] + '35',
                  marginTop: top_tail.length >= 3 ? (e.position !== 1 ? '16px' : '0px') : 'auto'
                }}
              >
                <Row sx={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Avatar variant="rounded" sx={{ width: '54px', height: '54px' }} alt={e.name} />
                  <CustomTypography
                    // variant="h1"
                    fontWeight={'bold'}
                    fontSize={'62px'}
                    color={colors[e.position] + 'fe'}
                  >
                    {e.position}
                  </CustomTypography>
                </Row>
                <CustomTypography
                  paddingBottom={'18px'}
                  variant="h4"
                  fontWeight={'medium'}
                  textAlign={'start'}
                >
                  {e.name}
                </CustomTypography>
                <CustomTypography paddingBottom={'32px'} fontWeight={'light'}>
                  Total {capitalizeSentence(data?.type)}:&nbsp;
                  <CustomTypography variant="h3">{e.weightLossOrWeightGain}</CustomTypography>
                </CustomTypography>
              </Card>
            )
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
            {genData.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={HEADER.length}>
                  No other participants found found
                </TableCell>
              </TableRow>
            ) : (
              genData.map((row, index) => (
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
                        onClick(row[row.length - 1] as string)
                      }}
                    >
                      {i === row.length - 1 ? (
                        <CustomIcon
                          name="LUCIDE_ICONS"
                          icon="LuArrowRight"
                          stopPropagation={false}
                        />
                      ) : (
                        r
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px'
})

const Card = styled('div')({
  width: '100%',
  maxWidth: '280px',
  borderRadius: '12px',
  backgroundColor: 'grey',
  padding: '12px 24px',
  cursor: 'pointer'
})
