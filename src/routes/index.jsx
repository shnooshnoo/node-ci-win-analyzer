import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

export const Index = () => (
  <>
    <Button component={Link} to="/tests">Tests</Button>
    <Button component={Link} to="/prs">PRs</Button>
  </>
)
