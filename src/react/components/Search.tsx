import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import { Option, toUndefined } from 'fp-ts/lib/Option'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      backgroundColor: '#eaeaea',
      paddingLeft: 8,
      display: 'flex',
      alignItems: 'center',
      width: 420,
      [theme.breakpoints.down('xs')]: {
        width: 'auto',
      },
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  })
)

export type SearchProps = {
  onLink: React.MouseEventHandler
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  onSubmit: (ev?: React.FormEvent<HTMLDivElement>) => void
  term: Option<string>
}

const Search: React.FC<SearchProps> = (props: SearchProps) => {
  const classes = useStyles()
  const { term, onChange, onSubmit } = props
  return (
    <Paper component="form" className={classes.root} onSubmit={onSubmit}>
      <InputBase
        autoFocus
        className={classes.input}
        placeholder="search movies…"
        onChange={onChange}
        value={toUndefined(term) || ''}
        spellCheck={false}
      />
      <IconButton type="submit" className={classes.iconButton}>
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default Search
