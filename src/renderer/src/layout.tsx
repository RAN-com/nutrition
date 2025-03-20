import { styled } from '@mui/material'
import React from 'react'

type Props = {
  children?: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <Container
      style={{
        height: window.screen.availHeight
      }}
    >
      {/* <TabBar>
        <TabBarTitleContainer>
          <img src={Icon} alt={'Nutrition'} />
          <CustomTypography variant="body2" color={grey['200']}>
            {title}
          </CustomTypography>
        </TabBarTitleContainer>
        <TabBarButtonContainer onClick={handleMinimize}>
          <Tooltip title={'Minimize'} followCursor={true}>
            <TabBarContainer className="minimize">
              <CustomIcon
                stopPropagation={false}
                name="LUCIDE_ICONS"
                icon="LuMinus"
                size={18}
                color={'#ffffffaa'}
              />
            </TabBarContainer>
          </Tooltip>
          <Tooltip title={'Close'} followCursor={true} onClick={handleQuit}>
            <TabBarContainer className="exit">
              <CustomIcon
                stopPropagation={false}
                name="LUCIDE_ICONS"
                icon="LuX"
                size={18}
                color={'#ffffffaa'}
              />
            </TabBarContainer>
          </Tooltip>
        </TabBarButtonContainer>
      </TabBar> */}
      <MainContainer>{children}</MainContainer>
    </Container>
  )
}

export default Layout

const Container = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '1fr'
})

const MainContainer = styled('div')({
  width: '100%',
  height: '100%'
})
