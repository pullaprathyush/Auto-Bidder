const { body, param, validationResult } = require('express-validator');

const reportValidationRules = () => {
    return[
        body('RegNo')
            .exists()
            .withMessage('RegNo is required'),

        body('MechanicCNIC')
            .exists()
            .withMessage('CNIC is required')
            .isLength({ max:15 })
            .withMessage('CNIC contains more than 15 characters'),

        body('total_points')
            .optional()
            .isInt()
            .withMessage('It is not a Number'),
    ];
};

const postComplaintValidationRules = () => {
    return[
        body('name')
            .exists()
            .withMessage('Complaint name/subject is required')
            .notEmpty()
            .withMessage('Complaint name/subject should not be empty'),

        body('complaint')
            .exists()
            .withMessage('Description of complaint is required')
            .notEmpty()
            .withMessage('Description of complaint should not be empty'),

        body('UserCNIC')
            .exists()
            .withMessage('CNIC is required')
            .isLength({ max:15 })
            .withMessage('CNIC contains more than 15 characters'),
    ];
};

// const putComplaintValidationRules = () => {
//     return[
//         param('complaintId')
//             .isInt()
//             .withMessage('Invalid Route Parameter'),
        
//         body('description')
//             .exists()
//             .withMessage('Description is required'),
//     ];
// };

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if(errors.isEmpty()){
        return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({ errors: extractedErrors });
};

module.exports = {
    reportValidationRules, postComplaintValidationRules, validate
};