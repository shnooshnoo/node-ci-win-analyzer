import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { PRs } from './prs/pr.jsx';
import { Tests } from './tests/tests.jsx';

const Index = () => (
  <>
    <Button component={Link} to="/tests">Tests</Button>
    <Button component={Link} to="/prs">PRs</Button>
  </>
)

export {
  Index,
  PRs,
  Tests
}
