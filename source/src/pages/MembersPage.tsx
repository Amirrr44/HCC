import { useCallback } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import { formatFingerprint } from '../services/crypto/crypto';
import { useBackButton } from '../hooks/useBackButton';

export function MembersPage() {
  const navigate = useNavigate();
  const members = useSession((s) => s.members);
  const channelName = useSession((s) => s.channel);

  // تابع یکپارچه برای دکمه نرم‌افزاری و دکمه UI بالای صفحه
  const handleBack = useCallback(() => {
    navigate('/chat', { replace: true });
  }, [navigate]);

  useBackButton({ onBack: handleBack });

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 1 }}>
            Members in #{channelName || 'lobby'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 640, mx: 'auto' }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Room participants ({members.length})
              </Typography>
              <Divider sx={{ my: 1 }} />
              {members.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                  No members detected yet.
                </Typography>
              ) : (
                <List id="members-list">
                  {members.map((m) => (
                    <ListItem key={m.nick} divider divider-component="li">
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" className="allow-text-select">
                              {m.nick}
                            </Typography>

                            {m.verified ? (
                              <Chip
                                size="small"
                                icon={<VerifiedUserRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Verified"
                                color="success"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            ) : m.signed ? (
                              <Chip
                                size="small"
                                icon={<ShieldRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Signed (Untrusted)"
                                color="warning"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<GppBadRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Unsigned"
                                color="default"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          m.fingerprint ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              className="allow-text-select"
                              sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}
                            >
                              FP: {formatFingerprint(m.fingerprint)}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No key presented (legacy / plaintext user)
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
