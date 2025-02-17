import CustomIcon from '../icons'
import CustomTypography from '../typography'

const Counter = ({
  onDecrement,
  onIncrement,
  value
}: {
  onIncrement(): void
  onDecrement(): void
  value: number
}) => {
  const increment = onIncrement
  const decrement = onDecrement

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minWidth: '100px',
        userSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <CustomIcon
        name="LUCIDE_ICONS"
        icon={'LuMinus'}
        color={value === 0 ? 'rgba(0, 0, 0, 0.26)' : 'rgba(0, 0, 0, 0.87)'}
        onClick={decrement}
        sx={{
          padding: '8px',
          backgroundColor: value === 0 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          borderRadius: '12px'
        }}
        size={18}
      />
      <CustomTypography
        sx={{ padding: '0px 12px' }}
        // fixed font size
        fontWeight={'bold'}
        width={'100%'}
      >
        {/* in two digists */}
        {value.toString()}
      </CustomTypography>
      <CustomIcon
        sx={{
          padding: '8px',
          backgroundColor: value === 0 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          borderRadius: '12px'
        }}
        size={18}
        color={value === 0 ? 'rgba(0, 0, 0, 0.26)' : 'rgba(0, 0, 0, 0.87)'}
        onClick={increment}
        name="LUCIDE_ICONS"
        icon={'LuPlus'}
      />
    </div>
  )
}

export default Counter
