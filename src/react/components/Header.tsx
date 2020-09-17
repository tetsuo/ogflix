import React from 'react'
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Search from './Search'
import { Option } from 'fp-ts/lib/Option'
import { hrefs } from '../router'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
      fontWeight: 700,
      fontSize: 24,
      color: '#999',
      marginRight: theme.spacing(2),
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    appBar: {
      backgroundColor: '#fff',
      paddingTop: '12px!important',
      paddingBottom: '12px!important',
      paddingLeft: '10px!important',
    },
  })
)

export type HeaderProps = {
  onLink: React.MouseEventHandler
  searchTerm: Option<string>
  onSearchChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  onSearchSubmit: (ev?: React.FormEvent<HTMLDivElement>) => void
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const classes = useStyles()

  const { onLink, searchTerm, onSearchChange, onSearchSubmit } = props

  return (
    <div className={classes.grow}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            <Link href={hrefs.home} onClick={onLink}>
              ogflix
            </Link>
          </Typography>
          <div className={classes.search}>
            <Search term={searchTerm} onChange={onSearchChange} onLink={onLink} onSubmit={onSearchSubmit} />
          </div>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default Header
