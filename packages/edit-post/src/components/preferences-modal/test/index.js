/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import EditPostPreferencesModal from '../';

// This allows us to tweak the returned value on each test.
jest.mock( '@wordpress/data/src/components/use-select', () => jest.fn() );
jest.mock( '@wordpress/compose/src/hooks/use-viewport-match', () => jest.fn() );

describe( 'EditPostPreferencesModal', () => {
	describe( 'should match snapshot when the modal is active', () => {
		it( 'large viewports', async () => {
			useSelect.mockImplementation( () => [ true, true, false ] );
			useViewportMatch.mockImplementation( () => true );
			render( <EditPostPreferencesModal /> );
			expect(
				await screen.findByRole( 'dialog', { name: 'Preferences' } )
			).toMatchSnapshot();
		} );
		it( 'small viewports', async () => {
			useSelect.mockImplementation( () => [ true, true, false ] );
			useViewportMatch.mockImplementation( () => false );
			render( <EditPostPreferencesModal /> );
			expect(
				await screen.findByRole( 'dialog', { name: 'Preferences' } )
			).toMatchSnapshot();
		} );
	} );

	it( 'should not render when the modal is not active', () => {
		useSelect.mockImplementation( () => [ false, false, false ] );
		render( <EditPostPreferencesModal /> );
		expect(
			screen.queryByRole( 'dialog', { name: 'Preferences' } )
		).not.toBeInTheDocument();
	} );
} );
