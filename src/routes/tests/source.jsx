export const Source = ({ callStack }) => {
  const lastItem = callStack[callStack.length - 1];

  if (lastItem.prId) {
    return (
      <a target="_blank" rel="noreferrer" href={`https://github.com/nodejs/node/pull/${lastItem.prId}`}>
        PR {lastItem.prId}
      </a>
    )
  }
  return (
    <a href={`https://ci.nodejs.org/${lastItem.upstreamUrl}${lastItem.upstreamBuild}`} target="_blank" rel="noreferrer">
      {lastItem.upstreamProject }, { lastItem.upstreamBuild}
    </a>
  );
}
