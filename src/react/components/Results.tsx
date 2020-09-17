import React from 'react'
import { date } from 'io-ts-types/lib/date'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Rating from '@material-ui/lab/Rating'
import classNames from 'classnames'
import { SearchResult } from '../../domain/tmdb'
import { hrefs } from '../router'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
    },
    block: {
      display: 'block',
    },
    avatar: {
      height: 240,
      width: 160,
      backgroundColor: '#e8e8e8',
    },
    listItemText: {
      marginLeft: 20,
    },
    divider: {
      margin: 12,
      marginBottom: 5,
    },
    simpleRating: {
      marginTop: 10,
      display: 'block',
    },
    link: {
      display: 'block',
      '&:hover .title > span:first-of-type': {
        textDecoration: 'underline!important',
        color: '#0000cc!important',
      },
    },
    description: {
      marginTop: 10,
      display: 'block',
      fontSize: 16,
    },
  })
)

export type ResultsProps = {
  onLink: React.MouseEventHandler
  results: Array<SearchResult>
}

const printTitle = (title: string, originalTitle: string) =>
  title === originalTitle ? title : `${title} (${originalTitle})`

const Results: React.FC<ResultsProps> = (props: ResultsProps) => {
  const classes = useStyles()
  const { results, onLink } = props
  return (
    <List className={classes.root}>
      {results.map(({ title, original_title, poster_path, id, overview, vote_average, release_date }) => {
        return (
          <div key={String(id)}>
            <Link
              href={hrefs.movie({ id })}
              className={classes.link}
              style={{ textDecoration: 'none' }}
              onClick={onLink}
            >
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar
                    alt={title}
                    src={poster_path ? `https://image.tmdb.org/t/p/w200${poster_path}` : undefined}
                    variant="rounded"
                    className={classes.avatar}
                  />
                </ListItemAvatar>
                <ListItemText
                  className={classNames(classes.listItemText, 'title')}
                  primary={<b style={{ fontSize: 20 }}>{printTitle(title, original_title)}</b>}
                  secondary={
                    <React.Fragment>
                      {date.is(release_date) ? (
                        <Typography variant="body2" style={{ display: 'block' }} component="span" color="textPrimary">
                          {release_date.getFullYear()}
                        </Typography>
                      ) : null}

                      <span className={classes.description}>
                        {overview}
                        <span className={classes.simpleRating}>
                          <Rating name="read-only" value={Math.min(5, vote_average / 2)} size="small" readOnly />
                        </span>
                      </span>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </Link>

            <Divider component="li" className={classes.divider} />
          </div>
        )
      })}
    </List>
  )
}

export default Results
