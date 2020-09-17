import React from 'react'
import * as A from 'fp-ts/lib/Array'
import { Option, toNullable, toUndefined } from 'fp-ts/lib/Option'
import { date } from 'io-ts-types/lib/date'
import { pipe } from 'fp-ts/lib/function'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import Link from '@material-ui/core/Link'
import { Movie } from '../../domain/tmdb'

const useStyles = makeStyles({
  root: {
    marginTop: 25,
    marginLeft: 18,
    width: '100%',
    maxWidth: 853,
  },
  video: {
    backgroundColor: '#e8e8e8',
    maxHeight: 505,
    marginTop: 20,
    height: 505,
    width: 853,
  },
  suggest: {
    padding: 20,
  },
})

export type MovieProps = {
  onLink: React.MouseEventHandler
  movie: Option<Movie>
}

const printTitle = (title: string, originalTitle: string) =>
  title === originalTitle ? title : `${title} (${originalTitle})`

const MovieComponent: React.FC<MovieProps> = (props: MovieProps) => {
  const classes = useStyles()
  const { movie } = props

  return pipe(toUndefined(movie), movie =>
    movie ? (
      <div className={classes.root}>
        <Typography gutterBottom variant="h5" component="h2">
          {printTitle(movie.title, movie.original_title)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {date.is(movie.release_date) ? (
            <Typography variant="body2" style={{ display: 'block' }} component="span" color="textPrimary">
              {movie.release_date.getFullYear()}
            </Typography>
          ) : null}
        </Typography>
        <div className={classes.video}>
          {pipe(
            movie.videos.results,
            A.filter(x => x.site === 'YouTube'),
            A.head,
            toNullable,
            x =>
              x ? (
                <iframe
                  width="853"
                  height="505"
                  src={`//www.youtube.com/embed/${x.key}`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={classes.suggest}>
                  <Typography variant="body1">{`this video doesn't exist in ogflix database`}</Typography>
                  <Typography variant="body2">{`but, maybe YOU can help solve this mystery`}</Typography>
                  <div>
                    <InputBase autoFocus placeholder="suggest a link…" spellCheck={false} />
                  </div>
                </div>
              )
          )}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link
            target="_blank"
            href={`//twitter.com/share?text=${encodeURIComponent(`Check this out! ${movie.title}`)}&url=${
              window.location.protocol
            }//${window.location.host}${window.location.pathname}i&hashtags=ogflix,movies,cool`}
          >
            Share on Twitter
          </Link>
        </div>
      </div>
    ) : null
  )
}

export default MovieComponent
