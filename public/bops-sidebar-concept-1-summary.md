# BOPS Sidebar Concept 1 - Summary

## Overview

This experiment explores a new page layout for the Back-office Planning System (BOPS) that features a fixed sidebar for task navigation alongside a main content area.

## Key Features

### Header Structure
- **Main header**: Full-width black header with "Southwark Back-office Planning System" branding on the left, user name and logout link on the right
- **Case summary bar**: Grey bar displaying the reference number and address for the current case
- Both headers are sticky and remain visible when scrolling

### Sidebar
- Fixed-width (280px) sidebar on the left side
- White background with GOV.UK border
- Independently scrollable when content exceeds viewport height

#### Top Navigation
- Overview, Meetings, Requests, Activity feed, Notes, Preview report
- Icons for each navigation item
- Notification badges showing counts (e.g., "2" for Meetings)
- Horizontal separator below

#### Tasklist
- "Tasklist" heading
- Flat list of tasks (no grouped subheaders)
- Rounded square checkboxes (4px border-radius)
- Three states:
  - **Completed**: Blue filled checkbox with white checkmark
  - **Active**: Light blue background highlight, empty checkbox with blue border
  - **Not started**: Empty checkbox with grey border

### Main Content Area
- Fills remaining viewport width
- Content constrained to max-width of 1100px and centered
- Independently scrollable
- Standard GOV.UK typography and spacing

## Layout Behaviour
- The page does not scroll as a whole
- Sidebar and main content scroll independently within their containers
- Header remains fixed at the top at all times

## Purpose
This layout is designed to provide persistent navigation and case context while allowing officers to work through assessment tasks without losing their place in the overall workflow.
