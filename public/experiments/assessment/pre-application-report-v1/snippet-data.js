/**
 * Mock Snippet Data
 * Sample assessment snippets from similar applications for prototyping
 */

var MOCK_SNIPPETS = [
  // ==========================================
  // AFFORDABLE HOUSING AND VIABILITY
  // ==========================================
  {
    id: 'snippet-001',
    applicationReference: '23-00421-HAPP',
    address: '12 Oak Street, Southwark, SE15 2AB',
    distanceMeters: 180,
    decisionDate: '2024-08-15',
    proposalType: 'householder',
    considerationType: 'affordable-housing-and-viability',
    considerationTitle: 'Affordable housing provision',
    status: 'complies',
    adviceText: 'The proposed development meets the minimum affordable housing requirement of 35%, which is the threshold for the Fast Track Route. The tenure mix of 70% social rent and 30% intermediate is acceptable and aligns with identified local housing need as set out in the Strategic Housing Market Assessment. The unit sizes and wheelchair accessible provision also meet policy requirements.',
    policyReferences: ['London Plan H4', 'Southwark Plan P1']
  },
  {
    id: 'snippet-002',
    applicationReference: '23-00398-FULC',
    address: '45-47 Rye Lane, Southwark, SE15 4ST',
    distanceMeters: 420,
    decisionDate: '2024-06-22',
    proposalType: 'full',
    considerationType: 'affordable-housing-and-viability',
    considerationTitle: 'Viability assessment',
    status: 'needs-changes',
    adviceText: 'The submitted viability assessment requires further scrutiny. The benchmark land value appears to be overstated when compared to recent comparable transactions in the area. Build costs should be benchmarked against BCIS data. We recommend the applicant provides additional evidence to support the sales value assumptions for the market units, particularly given recent market conditions.',
    policyReferences: ['London Plan H5', 'Southwark Plan IP3']
  },
  {
    id: 'snippet-003',
    applicationReference: '24-00089-FULC',
    address: '88 Peckham Road, Southwark, SE15 5LQ',
    distanceMeters: 650,
    decisionDate: '2024-11-30',
    proposalType: 'full',
    considerationType: 'affordable-housing-and-viability',
    considerationTitle: 'Review mechanism',
    status: 'complies',
    adviceText: 'An early and late stage review mechanism will be secured through the S106 agreement. The early review will be triggered if substantial implementation has not occurred within 2 years of the permission. The late stage review will apply to developments of 150 units or more and will be triggered prior to occupation of 75% of market units.',
    policyReferences: ['London Plan H5']
  },
  {
    id: 'snippet-004',
    applicationReference: '23-00512-FULC',
    address: '15 Camberwell Church Street, Southwark, SE5 8TR',
    distanceMeters: 890,
    decisionDate: '2024-03-18',
    proposalType: 'full',
    considerationType: 'affordable-housing-and-viability',
    considerationTitle: 'Affordable housing provision',
    status: 'does-not-comply',
    adviceText: 'The proposed affordable housing offer of 20% by habitable room is significantly below the 35% threshold required for the Fast Track Route. The applicant has not submitted a viability assessment to justify this shortfall. Without robust viability evidence, the scheme cannot be supported. The applicant is advised to either increase the affordable housing offer to 35% or submit a full viability assessment for independent review.',
    policyReferences: ['London Plan H4', 'London Plan H5', 'Southwark Plan P1']
  },

  // ==========================================
  // DESIGN AND CONSERVATION
  // ==========================================
  {
    id: 'snippet-005',
    applicationReference: '23-00356-HAPP',
    address: '22 Grove Park, Southwark, SE5 8LT',
    distanceMeters: 150,
    decisionDate: '2024-09-10',
    proposalType: 'householder',
    considerationType: 'design-and-conservation',
    considerationTitle: 'Impact on conservation area',
    status: 'complies',
    adviceText: 'The proposed extension is located at the rear of the property and would not be visible from public vantage points within the conservation area. The use of matching materials (London stock brick, natural slate) is appropriate and would ensure the extension reads as a sympathetic addition to the host dwelling. The modest scale and traditional design approach preserves the character and appearance of the conservation area.',
    policyReferences: ['Southwark Plan P17', 'Southwark Plan P18']
  },
  {
    id: 'snippet-006',
    applicationReference: '24-00067-HAPP',
    address: '8 Bellenden Road, Southwark, SE15 4RF',
    distanceMeters: 280,
    decisionDate: '2024-10-05',
    proposalType: 'householder',
    considerationType: 'design-and-conservation',
    considerationTitle: 'Design quality',
    status: 'needs-changes',
    adviceText: 'While the principle of a rear extension is acceptable, the proposed design requires refinement. The flat roof and aluminium-framed glazing system creates an overly contemporary contrast with the Victorian host building. Consider a more traditional approach using a pitched roof with slate tiles, or if a contemporary approach is preferred, ensure high-quality materials and detailing that creates a more considered dialogue with the existing building.',
    policyReferences: ['Southwark Plan P14', 'London Plan D3']
  },
  {
    id: 'snippet-007',
    applicationReference: '23-00445-FULC',
    address: '102-106 Lordship Lane, Southwark, SE22 8HF',
    distanceMeters: 1200,
    decisionDate: '2024-04-28',
    proposalType: 'full',
    considerationType: 'design-and-conservation',
    considerationTitle: 'Heritage impact - listed building setting',
    status: 'needs-changes',
    adviceText: 'The site is located within the setting of the Grade II listed Former Fire Station. The proposed 6-storey building would be visible in views from the listed building and would compete with its prominence in the streetscene. A reduction in height to 4 storeys with a setback upper floor is recommended to ensure the development does not detract from the significance of the heritage asset.',
    policyReferences: ['Southwark Plan P17', 'NPPF Chapter 16']
  },
  {
    id: 'snippet-008',
    applicationReference: '24-00112-HAPP',
    address: '67 Choumert Road, Southwark, SE15 4AR',
    distanceMeters: 340,
    decisionDate: '2024-12-01',
    proposalType: 'householder',
    considerationType: 'design-and-conservation',
    considerationTitle: 'Residential amenity - neighbouring properties',
    status: 'complies',
    adviceText: 'The proposed single storey rear extension would project 4 metres from the rear wall, which is within the acceptable parameters for extensions of this type. A 45-degree line drawn from the nearest habitable room window of the adjoining property would not be breached. The extension would not result in unacceptable loss of light, outlook or privacy to neighbouring occupiers.',
    policyReferences: ['Southwark Plan P14', 'Residential Design Standards SPD']
  },

  // ==========================================
  // LAND USE
  // ==========================================
  {
    id: 'snippet-009',
    applicationReference: '23-00289-FULC',
    address: '55 Camberwell Road, Southwark, SE5 0EZ',
    distanceMeters: 520,
    decisionDate: '2024-07-14',
    proposalType: 'full',
    considerationType: 'land-use',
    considerationTitle: 'Employment land',
    status: 'complies',
    adviceText: 'The site is located within a Locally Significant Industrial Site (LSIS). The proposed development retains the existing quantum of employment floorspace and introduces residential use above. This approach is consistent with policy which supports intensification of employment sites where the industrial capacity is maintained or increased. The proposed B1c/B8 units at ground floor are appropriately designed with adequate servicing arrangements.',
    policyReferences: ['Southwark Plan P28', 'London Plan E4']
  },
  {
    id: 'snippet-010',
    applicationReference: '24-00034-FULC',
    address: '201 Walworth Road, Southwark, SE17 1RL',
    distanceMeters: 780,
    decisionDate: '2024-09-22',
    proposalType: 'full',
    considerationType: 'land-use',
    considerationTitle: 'Town centre uses',
    status: 'needs-changes',
    adviceText: 'The site is located within Walworth Major Town Centre. The proposed change of use from retail (Class E) to residential (Class C3) at ground floor level would result in the loss of an active ground floor use in a primary shopping frontage. This conflicts with policy objectives to maintain and enhance the vitality of town centres. An active ground floor use should be retained, with residential use limited to upper floors.',
    policyReferences: ['Southwark Plan P33', 'London Plan SD6']
  },
  {
    id: 'snippet-011',
    applicationReference: '23-00567-FULC',
    address: '33 Nunhead Lane, Southwark, SE15 3TR',
    distanceMeters: 950,
    decisionDate: '2024-05-30',
    proposalType: 'full',
    considerationType: 'land-use',
    considerationTitle: 'Housing delivery',
    status: 'complies',
    adviceText: 'The proposed residential development would deliver 24 new homes, including 8 affordable units (35% by habitable room). This makes an important contribution to housing delivery targets and helps address the identified housing need in the borough. The mix of unit sizes (including 40% family-sized units of 3+ bedrooms) is policy compliant and responds to identified local need.',
    policyReferences: ['Southwark Plan P2', 'London Plan H1', 'London Plan H10']
  },
  {
    id: 'snippet-012',
    applicationReference: '24-00156-FULC',
    address: '78 Denmark Hill, Southwark, SE5 8RZ',
    distanceMeters: 1100,
    decisionDate: '2024-11-08',
    proposalType: 'full',
    considerationType: 'land-use',
    considerationTitle: 'Loss of public house',
    status: 'does-not-comply',
    adviceText: 'The proposal involves the loss of an Asset of Community Value (public house). Policy P42 resists the loss of pubs unless it can be demonstrated that the pub is no longer economically viable, or that the loss would not result in a shortfall of similar facilities in the area. The submitted marketing evidence is insufficient - the 6-month marketing period at an unrealistic asking price does not demonstrate genuine attempts to market the property as a pub.',
    policyReferences: ['Southwark Plan P42', 'London Plan HC7']
  },

  // Additional snippets for variety
  {
    id: 'snippet-013',
    applicationReference: '24-00201-HAPP',
    address: '5 Lyndhurst Way, Southwark, SE15 5AL',
    distanceMeters: 95,
    decisionDate: '2024-12-10',
    proposalType: 'householder',
    considerationType: 'design-and-conservation',
    considerationTitle: 'Roof extension',
    status: 'complies',
    adviceText: 'The proposed hip-to-gable loft conversion with rear dormer is acceptable in principle. The dormer is set within the roof slope with appropriate setbacks from the party walls and ridge line. The use of matching roof tiles and timber framed windows is appropriate. The design follows the established pattern of similar extensions in the street and would not appear incongruous.',
    policyReferences: ['Southwark Plan P14', 'Residential Design Standards SPD']
  },
  {
    id: 'snippet-014',
    applicationReference: '23-00678-FULC',
    address: '142 East Dulwich Road, Southwark, SE22 9AX',
    distanceMeters: 1450,
    decisionDate: '2024-02-14',
    proposalType: 'full',
    considerationType: 'affordable-housing-and-viability',
    considerationTitle: 'Affordable housing tenure',
    status: 'needs-changes',
    adviceText: 'While the overall quantum of affordable housing (35%) is acceptable, the proposed tenure mix requires adjustment. The current offer of 50% social rent / 50% intermediate does not meet the policy requirement of at least 70% social rent. The applicant should revise the tenure mix to achieve a minimum 70% social rent and maximum 30% intermediate to ensure the scheme addresses the most acute housing need.',
    policyReferences: ['London Plan H6', 'Southwark Plan P1']
  },
  {
    id: 'snippet-015',
    applicationReference: '24-00078-FULC',
    address: '250 Old Kent Road, Southwark, SE1 5UB',
    distanceMeters: 1800,
    decisionDate: '2024-10-25',
    proposalType: 'full',
    considerationType: 'land-use',
    considerationTitle: 'Old Kent Road Opportunity Area',
    status: 'complies',
    adviceText: 'The site falls within the Old Kent Road Opportunity Area where significant change is anticipated. The proposed mixed-use development comprising residential, workspace and community uses aligns with the strategic vision for the area. The re-provision of industrial floorspace at ground floor level with residential above demonstrates an appropriate approach to the intensification of this strategically important corridor.',
    policyReferences: ['Southwark Plan SP5', 'London Plan SD1', 'Old Kent Road AAP']
  }
];

// Export for use
window.MOCK_SNIPPETS = MOCK_SNIPPETS;
