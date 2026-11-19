URL	Expected
http://localhost:3000/parts?q=BP-123	The brake pad, found even with the dash
http://localhost:3000/parts?q=bp123	The same brake pad
http://localhost:3000/parts?model_id=1	3 parts (use your Corolla id)
http://localhost:3000/parts?model_id=abc	A 400 error: “model_id must be a whole number”
http://localhost:3000/parts	All 3 parts
http://localhost:3000/brands 
http://localhost:3000/models?brand_id=1


