import { styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'

export default function DetailsContent() {
  const post = useAppSelector((state) => state.post.currentPost!)
  const links = post?.links || []

  return (
    <Container>
      {/* Content for the post details goes here */}
      <CustomTypography variant="h4" fontWeight={'600'} letterSpacing={'-3%'} lineHeight={'100%'}>
        {post?.title}
      </CustomTypography>
      <CustomTypography
        variant="body1"
        marginTop={'16px'}
        lineHeight={'18px'}
        fontWeight={'400'}
        color={'textSecondary'}
        letterSpacing={'-1%'}
      >
        {post?.description || 'No description available for this post.'}
      </CustomTypography>
      {links.length >= 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <CustomTypography variant="body1" fontWeight={'600'} marginTop={'16px'}>
            Links:
          </CustomTypography>
          {links?.map((link, index) => (
            <CustomTypography
              key={index}
              variant="body1"
              color="primary"
              marginTop={'8px'}
              onClick={() => window.open(link.url, '_blank')}
              style={{ cursor: 'pointer', gap: '8px' }}
              sx={{
                '& .icon': {
                  opacity: 0,
                  width: 0,
                  transition: 'opacity 0.3s'
                },
                '&:hover .icon': {
                  opacity: 1,
                  width: '18px'
                }
              }}
            >
              <CustomIcon className="icon" name="LUCIDE_ICONS" icon="LuLink" size={18} />
              {link?.label || link?.url}
            </CustomTypography>
          ))}
        </div>
      )}
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 12px',
  boxSizing: 'border-box',
  gap: '4px'
})
