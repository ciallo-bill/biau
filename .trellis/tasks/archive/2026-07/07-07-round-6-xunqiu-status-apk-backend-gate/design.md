# Xunqiu Status APK Backend Gate Design

## Direction

Separate Xunqiu public status into independent signals:

- showcase / landing page availability;
- APK release approval and artifact evidence;
- backend/API health and deployment readiness;
- project-detail evidence and visitor explanation.

The main site should not imply APK or backend readiness unless a local synthetic result, public-safe status snapshot, or approved release artifact proves it.

## Candidate Improvements

- Add or tighten status contract checks for Xunqiu APK/backend fields.
- Regenerate or improve `xunqiu:synthetic` output if it can be done without secrets.
- Improve Xunqiu project-detail copy/visual captions to distinguish current public showcase, stage APK gate, and backend status.
- Add low-sensitive manual gate notes for backend production URL / release APK approval if missing.

## Safety

No signed artifact path, private backend URL, database string, API key, account, or APK link is committed unless it is already explicitly approved for public distribution.

