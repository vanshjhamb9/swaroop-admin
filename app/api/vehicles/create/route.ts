import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore, adminStorage } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    let dealerId: string;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      console.log('--- TEST MODE: Bypassing Auth check ---');
      dealerId = 'test-dealer-verified';
    } else {
      const decodedToken = await adminAuth.verifyIdToken(token);
      dealerId = decodedToken.uid;
    }

    let name, model, registration, experienceName, imageCount;
    let images: string[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart/form-data...');
      const formData = await request.formData();
      name = formData.get('name') as string;
      model = formData.get('model') as string;
      registration = formData.get('registration') as string;
      experienceName = formData.get('experienceName') as string || '';
      imageCount = parseInt(formData.get('imageCount') as string || '0');

      const filePromises: Promise<string>[] = [];
      const keys = Array.from(formData.keys());
      console.log('FormData keys received:', keys);

      let files = formData.getAll('images');
      if (files.length === 0) {
        console.log("No files found under 'images', checking 'images[]'...");
        files = formData.getAll('images[]');
      }

      console.log(`Found ${files.length} files/images in form data`);

      // If 'images' is not found, check if they sent indexed keys like images[0], images[1] etc
      // (Common in some client libraries)
      // For now, simpler implementation assuming 'images' field has multiple values

      const submissionId = Date.now().toString();

      for (const file of files) {
        if (typeof file !== 'string') {
          const processingFile = file as any;
          console.log(`Processing file: ${processingFile.name}, type: ${processingFile.type}, size: ${processingFile.size}`);
          // Upload to Firebase Storage
          const buffer = Buffer.from(await processingFile.arrayBuffer());
          // Group images by submission/experience using a timestamp folder
          // sanitize filename and keep extension
          const safeName = processingFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const filename = `dealers/${dealerId}/vehicles/${submissionId}/${safeName}`;

          const bucket = adminStorage.bucket();
          try {
            console.log(`Using bucket: ${bucket.name}`);
            const fileRef = bucket.file(filename);

            const uploadPromise = fileRef.save(buffer, {
              metadata: {
                contentType: processingFile.type,
              }
            }).then(() => {
              const publicUrl = fileRef.publicUrl();
              console.log(`Upload success: ${publicUrl}`);
              return publicUrl;
            }).catch(err => {
              console.error(`Upload failed for ${filename}:`, err);
              throw err;
            });
            filePromises.push(uploadPromise);
          } catch (storageError: any) {
            console.error(`Error initiating storage upload to ${filename} in bucket ${bucket.name}:`, storageError.message);
            if (storageError.code === 404) {
              throw new Error(`Storage Bucket '${bucket.name}' not found. Please ensure Storage is enabled in Firebase Console.`);
            }
            if (storageError.code === 403) {
              throw new Error(`Permission denied for bucket '${bucket.name}'. Ensure the service account has 'Storage Object Admin' role.`);
            }
            throw storageError;
          }
        } else if (typeof file === 'string') {
          // Handle case where it might be a URL string in form data
          images.push(file);
        }
      }

      console.log('Waiting for all uploads to complete...');
      const uploadedUrls = await Promise.all(filePromises);
      console.log('All uploads completed');
      images = [...images, ...uploadedUrls];

      // Update imageCount if not provided or 0
      if (!imageCount && images.length > 0) {
        imageCount = images.length;
      }

    } else {
      // Handle JSON
      const body = await request.json();
      name = body.name;
      model = body.model;
      registration = body.registration;
      experienceName = body.experienceName;
      imageCount = body.imageCount;
      images = body.images || [];
    }

    if (!name || !model || !registration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vehicleRef = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .add({
        name,
        model,
        registration,
        experienceName: experienceName || '',
        images: images || [],
        imageCount: imageCount || 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });

    return NextResponse.json({
      id: vehicleRef.id,
      message: 'Vehicle created successfully',
      images: images // Return the uploaded URLs so client knows
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
