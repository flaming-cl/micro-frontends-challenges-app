/*
  A stateless component that renders "sub track", "events" ,
  "platforms" and "technology" as tag.
  Sub Track and Events have topcoder color accent to denote track.
  Blue - Design, Green - Develop, Orange - Data Science
*/

import _ from "lodash";
import React from "react";
import PT from "prop-types";
import config from "../../../../config";

import {
  Tag,
  DataScienceTrackTag,
  DataScienceTrackEventTag,
  DesignTrackTag,
  DesignTrackEventTag,
  DevelopmentTrackTag,
  DevelopmentTrackEventTag,
  QATrackTag,
  QATrackEventTag,
} from "topcoder-react-ui-kit";

import { COMPETITION_TRACKS } from "utils/tc";
import VerifiedTag from "components/challenge-listing/VerifiedTag";
import MatchScore from "components/challenge-listing/ChallengeCard/MatchScore";
import { calculateScore } from "../../../utils/challenge-listing/helper";
import * as urlUtil from "utils/url";
import * as constants from "constants";
import "./style.module.scss";

export default function ChallengeTags(props) {
  const {
    challengeId,
    challengesUrl,
    track,
    challengeType,
    events,
    technPlatforms,
    setChallengeListingFilter,
    openForRegistrationChallenges,
  } = props;

  let EventTag;
  let TrackTag;
  switch (track) {
    case COMPETITION_TRACKS.DS:
      EventTag = DataScienceTrackEventTag;
      TrackTag = DataScienceTrackTag;
      break;
    case COMPETITION_TRACKS.DES:
      EventTag = DesignTrackEventTag;
      TrackTag = DesignTrackTag;
      break;
    case COMPETITION_TRACKS.DEV:
      EventTag = DevelopmentTrackEventTag;
      TrackTag = DevelopmentTrackTag;
      break;
    case COMPETITION_TRACKS.QA:
      EventTag = QATrackEventTag;
      TrackTag = QATrackTag;
      break;
    default:
      throw new Error("Wrong competition track value");
  }

  const filteredChallenge = _.find(openForRegistrationChallenges, {
    id: challengeId,
  });
  const matchSkills = filteredChallenge
    ? filteredChallenge.match_skills || []
    : [];
  const matchScore = filteredChallenge
    ? filteredChallenge.jaccard_index || []
    : 0;

  const tags = technPlatforms.filter((tag) => !matchSkills.includes(tag));

  const filterByChallengeType = urlUtil.buildQueryString({
    bucket: constants.FILTER_BUCKETS[1],
    tracks: _.values(constants.FILTER_CHALLENGE_TRACK_ABBREVIATIONS),
    page: 1,
  });

  const filterByTag = urlUtil.buildQueryString({
    bucket: constants.FILTER_BUCKETS[1],
    tracks: _.values(constants.FILTER_CHALLENGE_TRACK_ABBREVIATIONS),
    page: 1,
    types: _.values(constants.FILTER_CHALLENGE_TYPE_ABBREVIATIONS),
  });

  return (
    <div>
      {challengeType && (
        <TrackTag
          onClick={() =>
            setImmediate(() =>
              setChallengeListingFilter({ types: [challengeType.name] })
            )
          }
          to={`${challengesUrl}${filterByChallengeType}&types[]=${encodeURIComponent(
            challengeType.abbreviation
          )}`}
        >
          {challengeType.name}
        </TrackTag>
      )}
      {events.map((event) => (
        <EventTag to={`https://${event}.topcoder.com`} key={event}>
          {event}
        </EventTag>
      ))}
      {matchScore > 0 && config.ENABLE_RECOMMENDER && (
        <span styleName="matchScoreWrap">
          <MatchScore score={calculateScore(matchScore)} />
        </span>
      )}
      {matchSkills.map((item) => (
        <VerifiedTag item={item} challengesUrl={challengesUrl} />
      ))}
      {tags.map(
        (tag) =>
          tag && (
            <Tag
              key={tag}
              onClick={() =>
                setImmediate(() => setChallengeListingFilter({ tags: [tag] }))
              }
              to={`${challengesUrl}${filterByTag}&tags[]=${encodeURIComponent(tag)}`}
            >
              {tag}
            </Tag>
          )
      )}
    </div>
  );
}

ChallengeTags.defaultProps = {
  events: [],
  technPlatforms: [],
};

ChallengeTags.propTypes = {
  challengeId: PT.string.isRequired,
  challengesUrl: PT.string.isRequired,
  track: PT.string.isRequired,
  events: PT.arrayOf(PT.string),
  technPlatforms: PT.arrayOf(PT.string),
  setChallengeListingFilter: PT.func.isRequired,
  challengeType: PT.shape().isRequired,
  openForRegistrationChallenges: PT.shape().isRequired,
};
