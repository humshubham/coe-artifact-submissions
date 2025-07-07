import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  const defaultProps = {
    pageNo: 1,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render pagination controls', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('prev-page-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-page-button')).toBeInTheDocument();
      expect(screen.getByTestId('page-info')).toBeInTheDocument();
    });

    it('should display current page information', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 5');
    });

    it('should display correct page information for different pages', () => {
      render(<Pagination {...defaultProps} pageNo={3} totalPages={10} />);

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 3 of 10');
    });
  });

  describe('Navigation Buttons', () => {
    it('should call onPageChange with previous page when prev button is clicked', () => {
      render(<Pagination {...defaultProps} hasPrev={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(0);
    });

    it('should call onPageChange with next page when next button is clicked', () => {
      render(<Pagination {...defaultProps} />);

      const nextButton = screen.getByTestId('next-page-button');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange with correct page numbers', () => {
      render(<Pagination {...defaultProps} pageNo={3} hasPrev={true} hasNext={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      const nextButton = screen.getByTestId('next-page-button');

      fireEvent.click(prevButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);

      fireEvent.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Button States', () => {
    it('should disable prev button when hasPrev is false', () => {
      render(<Pagination {...defaultProps} hasPrev={false} />);

      const prevButton = screen.getByTestId('prev-page-button');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button when hasNext is false', () => {
      render(<Pagination {...defaultProps} hasNext={false} />);

      const nextButton = screen.getByTestId('next-page-button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable buttons when navigation is available', () => {
      render(<Pagination {...defaultProps} hasPrev={true} hasNext={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      const nextButton = screen.getByTestId('next-page-button');

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      render(<Pagination {...defaultProps} totalPages={1} hasNext={false} hasPrev={false} />);

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 1');
      expect(screen.getByTestId('prev-page-button')).toBeDisabled();
      expect(screen.getByTestId('next-page-button')).toBeDisabled();
    });

    it('should handle first page', () => {
      render(<Pagination {...defaultProps} pageNo={1} hasPrev={false} hasNext={true} />);

      expect(screen.getByTestId('prev-page-button')).toBeDisabled();
      expect(screen.getByTestId('next-page-button')).not.toBeDisabled();
    });

    it('should handle last page', () => {
      render(<Pagination {...defaultProps} pageNo={5} totalPages={5} hasPrev={true} hasNext={false} />);

      expect(screen.getByTestId('prev-page-button')).not.toBeDisabled();
      expect(screen.getByTestId('next-page-button')).toBeDisabled();
    });

    it('should handle page 0', () => {
      render(<Pagination {...defaultProps} pageNo={0} hasPrev={false} hasNext={true} />);

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 0 of 5');
      expect(screen.getByTestId('prev-page-button')).toBeDisabled();
      expect(screen.getByTestId('next-page-button')).not.toBeDisabled();
    });

    it('should handle very large page numbers', () => {
      render(<Pagination {...defaultProps} pageNo={999999} totalPages={1000000} hasPrev={true} hasNext={true} />);

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 999999 of 1000000');
    });
  });

  describe('Rapid User Interactions', () => {
    it('should handle rapid button clicks', () => {
      render(<Pagination {...defaultProps} hasPrev={true} hasNext={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      const nextButton = screen.getByTestId('next-page-button');

      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledTimes(3);
      expect(mockOnPageChange).toHaveBeenCalledWith(0);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
      expect(mockOnPageChange).toHaveBeenCalledWith(0);
    });

    it('should handle rapid clicks on disabled buttons', () => {
      render(<Pagination {...defaultProps} hasPrev={false} hasNext={false} />);

      const prevButton = screen.getByTestId('prev-page-button');
      const nextButton = screen.getByTestId('next-page-button');

      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);

      // Should not call onPageChange when buttons are disabled
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to page 0 when on page 1 and prev is clicked', () => {
      render(<Pagination {...defaultProps} pageNo={1} hasPrev={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(0);
    });

    it('should navigate to page 2 when on page 1 and next is clicked', () => {
      render(<Pagination {...defaultProps} pageNo={1} hasNext={true} />);

      const nextButton = screen.getByTestId('next-page-button');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should navigate to page 4 when on page 5 and prev is clicked', () => {
      render(<Pagination {...defaultProps} pageNo={5} hasPrev={true} />);

      const prevButton = screen.getByTestId('prev-page-button');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('should navigate to page 6 when on page 5 and next is clicked', () => {
      render(<Pagination {...defaultProps} pageNo={5} hasNext={true} />);

      const nextButton = screen.getByTestId('next-page-button');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle page 0 with prev disabled', () => {
      render(<Pagination {...defaultProps} pageNo={0} hasPrev={false} hasNext={true} />);

      expect(screen.getByTestId('prev-page-button')).toBeDisabled();
      expect(screen.getByTestId('next-page-button')).not.toBeDisabled();
    });

    it('should handle last page with next disabled', () => {
      render(<Pagination {...defaultProps} pageNo={5} totalPages={5} hasPrev={true} hasNext={false} />);

      expect(screen.getByTestId('prev-page-button')).not.toBeDisabled();
      expect(screen.getByTestId('next-page-button')).toBeDisabled();
    });

    it('should handle middle page with both enabled', () => {
      render(<Pagination {...defaultProps} pageNo={3} hasPrev={true} hasNext={true} />);

      expect(screen.getByTestId('prev-page-button')).not.toBeDisabled();
      expect(screen.getByTestId('next-page-button')).not.toBeDisabled();
    });
  });
}); 