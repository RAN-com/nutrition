import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, CircularProgress, styled, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@renderer/redux/store/hook";
import CustomIcon from "../icons";
import CustomTypography from "../typography";
import { setShowAvailableModal, setUpdateDownloaded } from "@renderer/redux/store/ui/slice";
import { infoToast } from "@renderer/utils/toast";
import React from "react";

const UpdateButton = styled(Button)({
    borderRadius: 8,
    padding: '8px 24px',
    // fontWeight: 600,
    textTransform: 'none',
});

export default function AppUpdate() {
    const dispatch = useAppDispatch()
    const { isAvailable, isDownloaded, showModalForAvailable, showModalForDownloaded, downloadProgress } = useAppSelector(s => s.ui.updates)

    // use this for testing
    // const downloadProgress = {
    //     percent: 100, // Example percentage, replace with actual value
    //     transferred: 1024 * 1024 * 10, // Example transferred bytes, replace with actual value
    //     total: 1024 * 1024 * 20, // Example total bytes, replace with actual value
    //     bytesPerSecond: 1024 * 1024 * 2 // Example speed in bytes per second, replace with actual value
    // }
    // const {
    //     isAvailable,
    //     isDownloaded,
    //     showModalForAvailable,
    //     showModalForDownloaded
    // } = { isAvailable: true, isDownloaded: false, showModalForAvailable: true, showModalForDownloaded: false }

    const handleClose = () => {
        dispatch(setShowAvailableModal(false));
        dispatch(setUpdateDownloaded(false));
        if (isAvailable && !isDownloaded) {
            infoToast("You can download the latest version by clicking on the update button in your profile")
        }
    };

    React.useEffect(() => {
        if (downloadProgress?.percent === 100) {
            dispatch(setUpdateDownloaded(true));
        }
    }, [downloadProgress])

    const handleDownload = () => {
        window.electron?.updateResponse("startDownload")
    };

    const handleInstall = () => {
        window.electron?.updateResponse("install_now")
    };

    return (
        <Dialog
            open={showModalForAvailable || showModalForDownloaded}
            onClose={handleClose}
            slotProps={{
                paper: {
                    sx: {
                        width: "100%",
                        maxWidth: "400px",
                        borderRadius: 2,
                        overflow: "hidden",
                        paddingBottom: "12px"
                    }
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: "center",
                gap: 1,
                py: 1.5
            }}>
                <CustomIcon color={"white"} changeCursor={false} stopPropagation={false} name="MATERIAL_DESIGN" icon="MdSystemUpdateAlt" />
                <Typography variant="h6">Application Update</Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                {isAvailable ? (
                    isDownloaded ? (
                        // Update Ready to Install UI - no changes needed
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <CustomIcon changeCursor={false} stopPropagation={false} name="LUCIDE_ICONS" icon={"LuCheck"} color="green" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" align="center" gutterBottom>
                                Update Ready to Install
                            </Typography>
                            <Typography variant="body1" align="center" color="text.secondary">
                                You have downloaded the latest update. Please install it now to enjoy the newest features and improvements.
                            </Typography>
                        </Box>
                    ) : !!downloadProgress ? (
                        // Add Download Progress UI in DialogContent
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <CustomIcon changeCursor={false} stopPropagation={false} name={"MATERIAL_DESIGN"} icon="MdCloudDownload" color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" align="center" gutterBottom>
                                Downloading Update
                            </Typography>
                            <Typography variant="body1" align="center" color="text.secondary">
                                Please wait while we download the latest version. This might take a few minutes.
                            </Typography>
                        </Box>
                    ) : (
                        // Update Available UI - no changes needed
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <CustomIcon changeCursor={false} stopPropagation={false} name={"MATERIAL_DESIGN"} icon="MdOutlineCloudDownload" color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" align="center" gutterBottom>
                                Update Available
                            </Typography>
                            <Typography variant="body1" align="center" color="text.secondary">
                                A new version of the application is available. Would you like to download it now?
                            </Typography>
                        </Box>
                    )
                ) : (
                    // Up to Date UI - no changes needed
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <CustomIcon changeCursor={false} stopPropagation={false} name="LUCIDE_ICONS" icon={"LuCheck"} color="green" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6" align="center" gutterBottom>
                            Up to Date
                        </Typography>
                        <Typography variant="body1" align="center" color="text.secondary">
                            You're already using the latest version of the application.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
                {isAvailable ? (
                    !!downloadProgress ? (
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                width: 80,
                                height: 80
                            }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={downloadProgress?.percent}
                                    size={80}
                                    thickness={4}
                                    sx={{ color: 'primary.main' }}
                                />
                                <Typography
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                    sx={{
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {`${Math.round(downloadProgress?.percent)}%`}
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    Downloading Update
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {`${(downloadProgress?.transferred / (1024 * 1024)).toFixed(2)} MB / ${(downloadProgress?.total / (1024 * 1024)).toFixed(2)} MB`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {`${(downloadProgress?.bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`}
                                    </Typography>
                                </Box>

                                <UpdateButton
                                    variant="outlined"
                                    onClick={handleClose}
                                    fullWidth
                                >
                                    Download in Background
                                </UpdateButton>
                            </Box>
                        </Box>
                    ) :
                        isDownloaded ? (
                            <>
                                <UpdateButton variant="outlined" onClick={handleClose}>
                                    Later
                                </UpdateButton>
                                <UpdateButton
                                    variant="contained"
                                    onClick={handleInstall}
                                    startIcon={<CustomIcon changeCursor={false} stopPropagation={false} name="MATERIAL_DESIGN" color="white" icon="MdSystemUpdateAlt" />}
                                >
                                    Install Now
                                </UpdateButton>
                            </>
                        ) : (
                            <>
                                <Tooltip title={
                                    <CustomTypography variant="caption" textAlign={"center"}>
                                        You can download the latest version by clicking on the update button in your profile
                                    </CustomTypography>
                                }>
                                    <span>
                                        <UpdateButton variant="outlined" onClick={handleClose}>
                                            Not Now
                                        </UpdateButton>
                                    </span>
                                </Tooltip>
                                <UpdateButton
                                    variant="contained"
                                    onClick={handleDownload}
                                    startIcon={<CustomIcon changeCursor={false} stopPropagation={false} name={"MATERIAL_DESIGN"} icon="MdOutlineCloudDownload" color="white" />}
                                >
                                    Download
                                </UpdateButton>
                            </>
                        )
                ) : (
                    <UpdateButton variant="contained" onClick={handleClose}>
                        Close
                    </UpdateButton>
                )}
            </DialogActions>
        </Dialog>
    );
}