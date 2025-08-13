import React, { useState, useEffect } from 'react';
import { Button } from '@/components/reactbit/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { Input } from '@/components/reactbit/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sslService } from '@/services/sslService';
import { SSLAlert } from '@/types/ssl';
import { 
  X, 
  Search, 
  History, 
  AlertCircle, 
  Calendar,
  Building,
  Shield,
  Loader2,
  Filter,
  Download
} from 'lucide-react';

interface ExpiredHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpiredHistoryModal: React.FC<ExpiredHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [expiredHistory, setExpiredHistory] = useState<SSLAlert[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SSLAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'expiryDate' | 'domain'>('expiryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (isOpen) {
      loadExpiredHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    filterAndSortHistory();
  }, [expiredHistory, searchTerm, sortBy, sortOrder]);

  const loadExpiredHistory = async () => {
    setIsLoading(true);
    try {
      const data = await sslService.getExpiredHistory();
      setExpiredHistory(data);
    } catch (error) {
      console.error('Error loading expired history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortHistory = () => {
    let filtered = expiredHistory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortBy === 'expiryDate') {
        aValue = new Date(a.expiryDate).getTime();
        bValue = new Date(b.expiryDate).getTime();
      } else {
        aValue = a.domain.toLowerCase();
        bValue = b.domain.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredHistory(filtered);
  };

  const handleSort = (field: 'expiryDate' | 'domain') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const exportToCSV = () => {
    const headers = ['Domain', 'Expiry Date', 'Days Ago', 'Issuer', 'Last Checked'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(item => [
        item.domain,
        formatDate(item.expiryDate),
        getDaysAgo(item.expiryDate),
        item.issuer,
        formatDate(item.lastChecked)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expired-ssl-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[80vh] border-0 shadow-2xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-red-600" />
            Expired SSL Certificates History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredHistory.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by domain or issuer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredHistory.length} expired certificates
            </Badge>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading expired history...</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow className="border-border/50">
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('domain')}
                    >
                      <div className="flex items-center gap-1">
                        Domain
                        <Filter className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead 
                      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('expiryDate')}
                    >
                      <div className="flex items-center gap-1">
                        Expiry Date
                        <Filter className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Days Ago</TableHead>
                    <TableHead className="font-semibold">Issuer</TableHead>
                    <TableHead className="font-semibold">Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <AlertCircle className="w-8 h-8" />
                          <p>No expired certificates found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((item) => (
                      <TableRow key={item.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
                            {item.domain}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" size="sm">
                            Expired
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.expiryDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" size="sm">
                            {getDaysAgo(item.expiryDate)} days ago
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {item.issuer}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(item.lastChecked)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
