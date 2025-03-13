import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Button,
  Tooltip,
  TablePagination,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutorenewIcon from '@mui/icons-material/Autorenew';

interface Repository {
  id: number;
  name: string;
  healthScore: number;
  lastAnalyzed: string;
  scores: {
    security: number;
    reliability: number;
    maintainability: number;
    collaboration: number;
    velocity: number;
  };
}

type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'healthScore' | 'lastAnalyzed';

interface HeadCell {
  id: OrderBy;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', numeric: false, label: 'Repository' },
  { id: 'healthScore', numeric: true, label: 'Health Score' },
  { id: 'lastAnalyzed', numeric: true, label: 'Last Analyzed' },
];

interface RepositoryListProps {
  repositories: Repository[];
}

function getScoreColor(score: number) {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 50) return 'warning';
  return 'error';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('healthScore');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter repositories based on search term
  const filteredRepositories = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort repositories
  const sortedRepositories = React.useMemo(() => {
    return [...filteredRepositories].sort((a, b) => {
      if (orderBy === 'name') {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (orderBy === 'healthScore') {
        return order === 'asc'
          ? a.healthScore - b.healthScore
          : b.healthScore - a.healthScore;
      } else if (orderBy === 'lastAnalyzed') {
        return order === 'asc'
          ? new Date(a.lastAnalyzed).getTime() - new Date(b.lastAnalyzed).getTime()
          : new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime();
      }
      return 0;
    });
  }, [filteredRepositories, order, orderBy]);

  // Pagination
  const paginatedRepositories = sortedRepositories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRepositories.length) : 0;

  return (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Repository List
        </Typography>
        <TextField
          size="small"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      <TableContainer>
        <Table aria-label="repository list">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRepositories.map((repo) => {
              const [owner, repoName] = repo.name.split('/');
              const scoreColor = getScoreColor(repo.healthScore);

              return (
                <TableRow
                  hover
                  key={repo.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GitHubIcon sx={{ mr: 1, fontSize: '1rem', color: 'primary.main' }} />
                      <Typography variant="body2">{repo.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Chip
                        label={`${repo.healthScore}%`}
                        size="small"
                        color={scoreColor as 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info'}
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                      <Box sx={{ width: 100, ml: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={repo.healthScore}
                          color={scoreColor as 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(repo.lastAnalyzed)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Re-analyze repository">
                        <IconButton size="small" color="primary">
                          <AutorenewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          color="primary"
                          component={RouterLink}
                          to={`/repository/${owner}/${repoName}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRepositories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default RepositoryList; 