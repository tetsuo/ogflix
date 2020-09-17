import * as React from 'react'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

export default function NotFound(): JSX.Element {
  return (
    <div>
      <DialogTitle>Not found</DialogTitle>
      <DialogContent>
        <Typography style={{ marginTop: '10px' }}>The requested resource was not found on this server</Typography>
      </DialogContent>
    </div>
  )
}
